'use strict';

const controller = require('./file.controller');

module.exports = opts => [
  {
    method: 'get',
    path: `${opts.baseUrl}/memo/:fileName`,
    handler: controller.memo,
  },
  {
    method: 'get',
    path: `${opts.baseUrl}/user-photo/:fileName`,
    handler: controller.updatePhoto,
  },
];
