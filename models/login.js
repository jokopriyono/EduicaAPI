const Sequelize = require('sequelize');

const db = require('../services/db');

class Login extends Sequelize.Model {}

Login.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    app_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    device_name: { type: Sequelize.STRING(100), allowNull: false },
    os_name: { type: Sequelize.STRING(100), allowNull: false },
    token: { type: Sequelize.TEXT, allowNull: false },
    refresh_token: { type: Sequelize.TEXT, allowNull: false },
    is_revoked: {
      type: Sequelize.TINYINT,
      allowNull: false,
      defaultValue: 0,
    },
    valid_until: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    deleted_at: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize: db,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    modelName: 'logins',
  },
);

module.exports = Login;
