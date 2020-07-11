const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const db = require('../services/db');

class User extends Sequelize.Model {}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: { type: Sequelize.STRING(255) },
    username: { type: Sequelize.STRING(100), unique: true, allowNull: false },
    email: { type: Sequelize.STRING(255), unique: true, allowNull: false },
    password: { type: Sequelize.STRING(255), allowNull: false },
    deleted_at: { type: Sequelize.DATE },
  },
  {
    sequelize: db,
    modelName: 'users',
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

User.prototype.hashPassword = function(password) {
  this.password = bcrypt.hashSync(password, 10);
};

User.prototype.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = User;
