'use strict';

const fs = require('fs');
const path = require('path');
const Router = require('koa-joi-router');
const _ = require('lodash');

const appRoutes = Router();
const baseName = path.basename(__filename);
const { apiVersion } = require('../config').server;
const authMiddleware = require('../middlewares/auth.middleware');

function applyApiMiddleware(app) {
  var apiRoutes = [];

  // Require all the folders and create a sub-router for each feature api
  fs.readdirSync(__dirname)
    .filter(file => file.indexOf('.') !== 0 && file !== baseName)
    .forEach(file => {
      const featureRoutes = require(path.join(__dirname, file))({
        baseUrl: `/${file}`,
      });
      featureRoutes.map(item => {
        // if route require authentication append preauth validation
        if (item.auth === undefined || item.auth === true) {
          _.extend(item, {
            pre: authMiddleware,
          });
        }
        return item;
      });
      apiRoutes = apiRoutes.concat(featureRoutes);
    });

  appRoutes.prefix(`/api/${apiVersion}`);
  appRoutes.route(apiRoutes);

  app.use(appRoutes.middleware());
}

module.exports = applyApiMiddleware;
