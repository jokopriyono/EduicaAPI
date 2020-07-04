const Sequelize = require('sequelize');

const db = require('../services/db');

class BlacklistedToken extends Sequelize.Model {}

BlacklistedToken.init(
  {
    token: { type: Sequelize.TEXT },
  },
  {
    sequelize: db,
    underscored: true,
    timestamps: false,
    modelName: 'blacklistedToken',
  },
);

BlacklistedToken.removeAttribute('id');

module.exports = BlacklistedToken;
