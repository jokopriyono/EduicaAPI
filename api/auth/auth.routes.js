'use strict';

const joi = require('joi');

const controller = require('./auth.controller');
const login = {
  type: 'json',
  body: joi
    .object({
      phone: joi.string(),
      email: joi
        .string()
        .email()
        .max(50)
        .required(),
      device: joi
        .string()
        .max(100)
        .required(),
      os: joi
        .string()
        .max(100)
        .required(),
      password: joi
        .string()
        .max(255)
        .required(),
      fcm: joi
        .string()
        .allow('', null)
        .max(255)
        .optional(),
    })
    .xor('phone', 'email'),
};

module.exports = opts => [
  {
    method: 'post',
    auth: false,
    path: `${opts.baseUrl}/authenticate`,
    handler: controller.authenticate,
    validate: login,
  },
  {
    method: 'post',
    auth: false,
    path: `${opts.baseUrl}/employee`,
    handler: controller.employee,
    validate: login,
  },
  {
    method: 'put',
    auth: false,
    path: `${opts.baseUrl}/refresh`,
    handler: controller.refresh,
    validate: {
      type: 'json',
      body: {
        refreshtoken: joi.string().required(),
        device: joi
          .string()
          .max(100)
          .required(),
        os: joi
          .string()
          .max(100)
          .required(),
      },
    },
  },
];
