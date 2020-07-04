'use strict';

const controller = require('./sys.controller');

module.exports = opts => [
  { method: 'get', path: opts.baseUrl + '/ping', handler: controller.ping },
];
