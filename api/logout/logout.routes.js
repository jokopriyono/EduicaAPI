'use strict';

const controller = require('../auth/auth.controller');

module.exports = opts => [
  {
    method: 'post',
    path: `${opts.baseUrl}/`,
    handler: controller.logout,
  },
];
