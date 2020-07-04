'use strict';

const _ = require('lodash');

const Application = require('../../models/application');
const Login = require('../../models/login');
const User = require('../../models/user');
const UserPermission = require('../../models/user-permission');
const UserPhoto = require('../../models/user-photo');
const BlacklistedToken = require('../../models/blacklisted-token');
const authHelper = require('../../helpers/auth');
const utils = require('../../helpers/utils');
const { auth } = require('../../config');
const { jwt: jwtConfig } = auth;
const moment = require('moment');
const baseUrl = process.env.API_URL;
const v = process.env.API_VERSION;

async function findUser(query) {
  const user = await User.findOne({
    where: query,
    include: [
      {
        model: UserPermission,
        required: false,
        attributes: ['is_readable', 'is_writeable'],
        where: { deleted_at: null },
      },
    ],
  });
  const findLastPhoto = await UserPhoto.findOne({
    where: { deleted_at: null, user_id: user.dataValues.id },
  });
  let photoUrl;
  if (findLastPhoto) {
    photoUrl = `${baseUrl}/api/${v}/files/user-photo/${
      findLastPhoto.dataValues.file_name
    }`;
  } else {
    photoUrl = user.dataValues.gender
      ? `${baseUrl}/api/${v}/files/user-photo/default-male.jpg`
      : `${baseUrl}/api/${v}/files/user-photo/default-female.jpg`;
  }
  user.dataValues.photo = photoUrl;
  return user;
}

async function signInUser(user, app, device, os) {
  // generate jwtid
  const tokenId = authHelper.generateJwtId(user.email);
  user.dataValues.token = {
    access_token: authHelper.generateAccessToken(user),
    refresh_token: authHelper.generateRefreshToken(tokenId),
    token_type: jwtConfig.type,
    expires_in: jwtConfig.expires,
  };

  await Login.update(
    {
      is_revoked: '1',
    },
    {
      where: {
        user_id: user.dataValues.id,
        is_revoked: '0',
      },
    },
  );

  let until = Date.now();
  until += user.dataValues.token.expires_in;
  await Login.create({
    app_id: app.dataValues.id,
    user_id: user.dataValues.id,
    device_name: device,
    os_name: os,
    token: user.dataValues.token.access_token,
    refresh_token: user.dataValues.token.refresh_token,
    valid_until: new Date(until),
  });
  delete user.dataValues.password;
  delete user.dataValues.is_special;
  delete user.dataValues.deleted_at;
  delete user.dataValues.parent_user_id;
  delete user.dataValues.is_suspended;
  delete user.dataValues.rating;
  delete user.dataValues.token.expires_in;
  user.dataValues.token.valid_until = new Date(until);
  return user;
}

/**
 * Authenticate user by email or phone
 * @param ctx
 * @returns {Promise<void>}
 */
exports.authenticate = async ctx => {
  const { phone, email, password, device, os, fcmtoken } = ctx.request.body;
  const query = { is_special: '1', deleted_at: null };

  const key = ctx.req.headers['x-api-key'];
  if (!key) ctx.throw(404);
  const app = await Application.findOne({
    where: {
      key,
      deleted_at: null,
    },
  });
  ctx.assert(app, 401);

  // query user with phone / email
  _.extendWith(query, _.omitBy({ phone, email }, _.isUndefined));

  const user = await findUser(query);
  if (user && user.isValidPassword(password)) {
    ctx.body = await signInUser(user, app, device, os);
    return;
  }

  ctx.throw(401, 'Invalid credential');
};

/**
 * Authenticate employee by email
 * @param ctx
 * @returns {Promise<void>}
 */
exports.employee = async ctx => {
  const { phone, email, password, device, os, fcmtoken } = ctx.request.body;
  const query = { is_special: '0', deleted_at: null };

  const key = ctx.req.headers['x-api-key'];
  if (!key) ctx.throw(404);
  const app = await Application.findOne({
    where: {
      key,
      deleted_at: null,
    },
  });
  ctx.assert(app, 401);

  // query user with phone / email
  _.extendWith(query, _.omitBy({ phone, email }, _.isUndefined));

  const user = await findUser(query);
  if (user && user.isValidPassword(password)) {
    await saveFcm(user.dataValues.id, fcmtoken);
    ctx.body = await signInUser(user, app, device, os);
    return;
  }

  ctx.throw(401, 'Invalid credential');
};

/**
 * Get new access_token with refresh_token
 * @param ctx
 * @returns {Promise<void>}
 */
exports.refresh = async ctx => {
  const key = ctx.req.headers['x-api-key'];
  ctx.assert(key, 404);
  const app = await Application.findOne({
    where: {
      key,
      deleted_at: null,
    },
  });
  ctx.assert(app, 401);

  const token = ctx.request.body.refreshtoken;
  const [blacklistedToken, created] = await BlacklistedToken.findOrCreate({
    where: { token },
  });
  // if token already blacklisted throw 401
  if (blacklistedToken && created === false) {
    ctx.throw(401);
    return;
  }

  const payload = await authHelper.validateToken(token, true);
  if (payload && payload.jti) {
    let tokenId;

    // construct email from jwtid
    tokenId = utils.fromBase64(payload.jti);
    const email = tokenId.split('|')[0];

    const user = await User.findOne({ where: { email, deleted_at: null } });
    ctx.assert(user, 401);

    // generate jwtid
    tokenId = authHelper.generateJwtId(user.email);
    const token = {
      access_token: authHelper.generateAccessToken(user),
      refresh_token: authHelper.generateRefreshToken(tokenId),
      token_type: jwtConfig.type,
      expires_in: jwtConfig.expires,
    };

    const findLogin = await Login.findOne({
      where: {
        user_id: user.dataValues.id,
        is_revoked: '0',
        deleted_at: null,
      },
    });
    ctx.assert(findLogin, 404);

    let until = moment().add(1, 'M');
    ctx.body = await findLogin
      .update({
        token: token.access_token,
        refresh_token: token.refresh_token,
        valid_until: until,
      })
      .then(function(result) {
        delete result.dataValues.id;
        delete result.dataValues.app_id;
        delete result.dataValues.user_id;
        delete result.dataValues.is_revoked;
        delete result.dataValues.deleted_at;
        delete result.dataValues.created_at;
        delete result.dataValues.updated_at;
        return result;
      });
    return;
  }
  ctx.throw(401, 'Invalid credential');
};

exports.logout = async ctx => {
  const key = ctx.req.headers['x-api-key'];
  if (!key) ctx.throw(404);
  const app = await Application.findOne({
    where: {
      key,
      deleted_at: null,
    },
  });
  ctx.assert(app, 401);

  const result = await Login.update(
    {
      is_revoked: '1',
    },
    {
      where: {
        user_id: ctx.user.id,
      },
    },
  );
  ctx.assert(result, 401);
  ctx.body = {};
};
