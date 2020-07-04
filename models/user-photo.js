const Sequelize = require('sequelize');

const db = require('../services/db');
const User = require('./user');

class UserPhoto extends Sequelize.Model {}

UserPhoto.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users', // table name
        key: 'id', // 'id' refers to column name
      },
    },
    file_name: { type: Sequelize.STRING, allowNull: false },
    ext: { type: Sequelize.STRING, allowNull: false },
    deleted_at: { type: Sequelize.DATE },
  },
  {
    sequelize: db,
    underscored: true,
    createdAt: 'uploaded_at',
    updatedAt: 'updated_at',
    modelName: 'user_photos',
  },
);

UserPhoto.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserPhoto, { as: 'photos' });

module.exports = UserPhoto;
