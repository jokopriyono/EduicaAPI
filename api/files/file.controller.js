'use strict';

const fs = require('fs');
const mimeType = require('mime-types');
const appDir = require('path').dirname(require.main.filename);

exports.memo = async ctx => {
  const { fileName } = ctx.params;
  ctx.assert(fileName, 404);

  const MemoAttachment = require('../../models/memo-attachment');
  const Memo = require('../../models/memo');
  const find = await MemoAttachment.findOne({
    where: {
      deleted_at: null,
      file_name: fileName,
    },
    include: [
      {
        model: Memo,
        required: true,
        attributes: ['id', 'from_user_id', 'to_user_id'],
      },
    ],
    attributes: {
      exclude: ['memo_id', 'deleted_at'],
    },
  });
  ctx.assert(find, 404);

  const reqUserId = parseInt(ctx.user.id);
  if (
    find.dataValues.memo.to_user_id !== reqUserId &&
    find.dataValues.memo.from_user_id !== reqUserId
  ) {
    ctx.throw(401, 'You are not allowed to read this file');
  }

  ctx.attachment(fileName);
  ctx.type = mimeType.lookup(fileName);
  const f = `${appDir}/public/memos/${fileName}`;
  if (!fs.existsSync(f)) {
    ctx.throw(404, "File doesn't exist");
  }
  ctx.body = fs.createReadStream(f);
};

exports.updatePhoto = async ctx => {
  const { fileName } = ctx.params;
  ctx.assert(fileName, 404);
  ctx.attachment(fileName);
  ctx.type = mimeType.lookup(fileName);
  const f = `${appDir}/public/profiles/${fileName}`;
  if (!fs.existsSync(f)) {
    ctx.throw(404, "File doesn't exist");
  }
  ctx.body = fs.createReadStream(f);
};
