'use strict';

const jwt = require('jsonwebtoken');
const uuid4 = require('uuid/v4');
const { auth, appName, apiUrl } = require('../config');
const { jwt: jwtConfig, userFields } = auth;
const utils = require('../helpers/utils');

const signOptions = {
  algorithm: jwtConfig.algorithm,
  subject: uuid4(),
  issuer: apiUrl,
  // later we will use this field
  // to refer uuid of application name
  audience: uuid4(),
};

exports.generateJwtId = identifier =>
  utils.toBase64(`${identifier}|${uuid4()}|${Math.round(+new Date() / 1000)}`);

exports.generateAccessToken = user => {
  let customClaims = {};

  userFields.forEach(userField => {
    if (!user[userField]) {
      return null;
    }

    customClaims[`x-${appName}-${userField.replace('_', '-')}`] =
      user[userField] && user[userField].toString();
  });

  return jwt.sign(
    {
      tokenName: 'access_token',
      tokenType: jwtConfig.type,
      // permissions: encryption.encrypt(JSON.stringify(permissions)),
      [apiUrl]: {
        [`x-${appName}-user-id`]: user.id.toString(),
        ...customClaims,
      },
    },
    jwtConfig.secret,
    {
      expiresIn: `${jwtConfig.expires / 60}m`,
      jwtid: this.generateJwtId(user.email),
      ...signOptions,
    },
  );
};

exports.generateRefreshToken = (tokenId, payload = {}) => {
  return jwt.sign(
    {
      tokenName: 'refresh_token',
      tokenType: jwtConfig.type,
      ...payload,
    },
    jwtConfig.refreshSecret,
    {
      expiresIn: `${jwtConfig.refresh_expires / 60}m`,
      jwtid: tokenId,
      ...signOptions,
    },
  );
};

exports.validateToken = (token, isRefresh = false) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      isRefresh ? jwtConfig.refreshSecret : jwtConfig.secret,
      (err, decoded) => {
        if (err) {
          return reject(new Error('Invalid token'));
        }
        return resolve(decoded);
      },
    );
  });
};
