const Sequelize = require('sequelize');

const db = require('../services/db');
const Login = require('./login');

class Application extends Sequelize.Model {}

Application.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: Sequelize.STRING(100), allowNull: false },
    desc: { type: Sequelize.STRING(200), allowNull: false },
    key: { type: Sequelize.STRING(255), allowNull: false },
    version_code: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    version_name: {
      type: Sequelize.STRING(50),
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
    modelName: 'applications',
  },
);

Application.hasMany(Login, { foreignKey: 'app_id' });
Login.belongsTo(Application, { foreignKey: 'app_id' });

module.exports = Application;
