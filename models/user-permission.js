const Sequelize = require('sequelize');

const db = require('../services/db');

class UserPermission extends Sequelize.Model {}

UserPermission.init(
  {
    is_readable: { type: Sequelize.TINYINT(1), allowNull: false },
    is_writeable: { type: Sequelize.TINYINT(1), allowNull: false },
    deleted_at: { type: Sequelize.DATE },
  },
  {
    sequelize: db,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    modelName: 'userPermission',
  },
);

module.exports = UserPermission;
