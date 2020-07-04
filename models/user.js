const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const db = require('../services/db');
const UserPermission = require('./user-permission');

class User extends Sequelize.Model {}

User.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    parent_user_id: { type: Sequelize.INTEGER, allowNull: true },
    full_name: { type: Sequelize.STRING(100), allowNull: false },
    status: { type: Sequelize.STRING(100), allowNull: true },
    area: { type: Sequelize.STRING(255), allowNull: true },
    address: { type: Sequelize.STRING(200), allowNull: true },
    phone: { type: Sequelize.STRING(20), unique: true, allowNull: false },
    gender: { type: Sequelize.TINYINT(1), allowNull: false },
    email: { type: Sequelize.STRING(50), unique: true, allowNull: false },
    password: { type: Sequelize.STRING, allowNull: false },
    is_special: { type: Sequelize.TINYINT(1), allowNull: false },
    is_suspended: { type: Sequelize.TINYINT(1), allowNull: false },
    rating: { type: Sequelize.INTEGER, allowNull: false },
    deleted_at: { type: Sequelize.DATE },
  },
  {
    sequelize: db,
    modelName: 'users',
    underscored: true,
    createdAt: 'registered_at',
    updatedAt: 'updated_at',
  },
);

User.prototype.hashPassword = function(password) {
  this.password = bcrypt.hashSync(password, 10);
};

User.prototype.isValidPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// associate userPermission
User.hasMany(UserPermission, { foreignKey: 'user_id' });
UserPermission.belongsTo(User, { foreignKey: 'user_id' });

// User.hasMany(GardenTemplate, {
//   as: 'garden_template_created',
//   foreignKey: 'created_by',
// });
// User.hasMany(GardenTemplate, {
//   as: 'garden_template_updated',
//   foreignKey: 'updated_by',
// });

module.exports = User;
