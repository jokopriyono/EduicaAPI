const Sequelize = require('sequelize');

const { database: db } = require('../config');

module.exports = new Sequelize(db);
