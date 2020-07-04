'use strict';

const UserPhoto = require('../../models/user-photo');
const User = require('../../models/user');
const allowedMimeType = ['image/jpeg', 'image/png'];
const fs = require('fs');
const path = require('path');
const baseUrl = process.env.API_URL;
const v = process.env.API_VERSION;
const _ = require('lodash');

async function getUser(id) {
  return User.findByPk(id, {
    attributes: {
      exclude: [
        'parent_user_id',
        'password',
        'is_special',
        'is_suspended',
        'deleted_at',
      ],
    },
    include: [
      {
        model: UserPhoto,
        required: false,
        as: 'photos',
        where: { deleted_at: null },
      },
    ],
  });
}

exports.readProfile = async ctx => {
  const result = await getUser(ctx.user.id);
  let photoUrl;
  if (result.dataValues.photos) {
    photoUrl = `${baseUrl}/api/${v}/files/user-photo/${
      result.dataValues.photos[0].file_name
    }`;
    delete result.dataValues.photos;
  } else {
    photoUrl = result.dataValues.gender
      ? `${baseUrl}/api/${v}/files/user-photo/default-male.jpg`
      : `${baseUrl}/api/${v}/files/user-photo/default-female.jpg`;
  }
  result.dataValues.photo = photoUrl;
  ctx.body = result;
};

exports.updateProfile = async ctx => {
  const findUser = await getUser(ctx.user.id);
  ctx.assert(findUser, 404);
  const { fullname, phone, gender, address } = ctx.request.body;

  _.extend(
    findUser,
    _.omitBy(
      {
        full_name: fullname,
        phone,
        gender,
        address,
      },
      _.isUndefined,
    ),
  );
  let photoUrl;
  if (findUser.dataValues.photos) {
    photoUrl = `${baseUrl}/api/${v}/files/user-photo/${
      findUser.dataValues.photos[0].file_name
    }`;
    delete findUser.dataValues.photos;
  } else {
    photoUrl = findUser.dataValues.gender
      ? `${baseUrl}/api/${v}/files/user-photo/default-male.jpg`
      : `${baseUrl}/api/${v}/files/user-photo/default-female.jpg`;
  }
  findUser.dataValues.photo = photoUrl;
  ctx.body = await findUser.save();
};

exports.updatePassword = async ctx => {
  const findUser = await User.findByPk(ctx.user.id);
  ctx.assert(findUser, 404);

  const { oldpass, newpass } = ctx.request.body;
  if (findUser.isValidPassword(oldpass)) {
    findUser.hashPassword(newpass);
  } else {
    ctx.throw(400, 'Old password mismatch');
  }
  await findUser.save();
  ctx.body = {};
};

exports.updatePhoto = async ctx => {
  const parts = ctx.request.parts;
  let part;
  try {
    // eslint-disable-next-line no-unmodified-loop-condition
    while ((part = await parts)) {
      if (!parts.field || !part) {
        ctx.throw(400, 'file is required');
      } else {
        const findLastPhoto = await UserPhoto.findOne({
          where: {
            deleted_at: null,
            user_id: ctx.user.id,
          },
        });
        if (findLastPhoto) {
          await findLastPhoto.update({
            deleted_at: new Date(),
          });
        }

        const fileNameExt = part.filename.split('.');
        if (fileNameExt.length < 2) {
          ctx.throw(400, 'Invalid file');
        }
        if (!allowedMimeType.includes(part.mimeType)) {
          ctx.throw(400, 'This file type not allowed');
        }

        const name = Date.now().toString() + '_' + part.filename;
        const appDir = path.dirname(require.main.filename);
        await part
          .pipe(
            fs
              .createWriteStream(`${appDir}/public/profiles/${name}`)
              .on('error', function(err) {
                ctx.throw(500, err.message);
              }),
          )
          .on('error', function(err) {
            ctx.throw(500, err.message);
          });
        await UserPhoto.create({
          user_id: ctx.user.id,
          file_name: name,
          ext: fileNameExt[fileNameExt.length - 1],
        });
        const photoUrl = `${baseUrl}/api/${v}/files/user-photo/${name}`;
        ctx.body = { photo: photoUrl };
      }
    }
  } catch (err) {
    ctx.throw(400, err.message);
  }
};
