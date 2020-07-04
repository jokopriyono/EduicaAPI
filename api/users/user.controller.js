'use strict';

const _ = require('lodash');

const db = require('../../services/db');
const User = require('../../models/user');
const UserPermission = require('../../models/user-permission');

/**
 * Get user
 * @param id
 * @returns {Promise<void>}
 */
const getUser = id =>
  User.findOne({
    where: { id, deleted_at: null },
    include: [
      { model: UserPermission, required: false, where: { deleted_at: null } },
    ],
  });

/**
 * Get user permission
 * @param userId
 * @param permissionId
 * @returns {Promise<void>}
 */
const getUserPermission = (userId, permissionId) =>
  UserPermission.findOne({
    where: { user_id: userId, permission_id: permissionId, deleted_at: null },
  });

/**
 * Get single registered user
 * @param ctx
 * @returns {Promise<void>}
 */
exports.get = async ctx => {
  const { userId } = ctx.params;
  const user = await getUser(userId);
  ctx.assert(user, 404);
  ctx.body = user;
};

/**
 * Get all registered users
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getAll = async ctx => {
  ctx.body = await User.findAll({
    where: { deleted_at: null },
    include: [
      { model: UserPermission, required: false, where: { deleted_at: null } },
    ],
  });
};

/**
 * Create new user
 * @param ctx
 * @returns {Promise<void>}
 */
exports.create = async ctx => {
  const { fullName, phone, gender, email, password } = ctx.request.body;
  const user = User.build({
    full_name: fullName,
    phone,
    gender,
    email,
  });
  user.hashPassword(password);
  ctx.body = await user.save();
};

/**
 * Update user
 * @param ctx
 * @returns {Promise<void>}
 */
exports.update = async ctx => {
  const { userId } = ctx.params;

  const user = await getUser(userId);
  ctx.assert(user, 404);

  const { fullName, phone, gender, email, password } = ctx.request.body;
  _.extend(
    user,
    // replace existing user object value & filter undefined
    _.omitBy(
      {
        full_name: fullName,
        phone,
        gender,
        email,
      },
      _.isUndefined,
    ),
  );
  if (password) user.hashPassword(password);

  ctx.body = await user.save();
};

/**
 * Delete user
 * @param ctx
 * @returns {Promise<void>}
 */
exports.delete = async ctx => {
  const { userId } = ctx.params;

  const user = await getUser(userId);
  ctx.assert(user, 404);

  ctx.body = await user.update({
    deleted_at: new Date(),
  });
};

/**
 * Remove user permission
 * @param ctx
 * @returns {Promise<void>}
 */
exports.removeUserPermission = async ctx => {
  const { userId, permissionId } = ctx.params;

  const userPermission = await getUserPermission(userId, permissionId);
  ctx.assert(userPermission, 404, 'User permission is not found!');

  ctx.body = await userPermission.update({
    deleted_at: new Date(),
  });
};
