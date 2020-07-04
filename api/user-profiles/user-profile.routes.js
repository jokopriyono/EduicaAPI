'use strict';

const joi = require('joi');

const controller = require('./user-profile.controller');

module.exports = opts => [
  {
    method: 'get',
    path: opts.baseUrl + '/',
    handler: controller.readProfile,
  },
  {
    method: 'put',
    path: opts.baseUrl + '/',
    validate: {
      type: 'json',
      body: {
        fullname: joi
          .string()
          .max(100)
          .required(),
        address: joi
          .string()
          .max(200)
          .optional(),
        phone: joi
          .string()
          .max(20)
          .optional(),
        gender: joi
          .number()
          .valid([0, 1])
          .optional(),
      },
    },
    handler: controller.updateProfile,
  },
  {
    method: 'put',
    path: opts.baseUrl + '/password',
    validate: {
      type: 'json',
      body: {
        oldpass: joi
          .string()
          .min(8)
          .max(100)
          .required(),
        newpass: joi
          .string()
          .min(8)
          .max(100)
          .required(),
      },
    },
    handler: controller.updatePassword,
  },
  {
    method: 'put',
    path: opts.baseUrl + '/photo',
    validate: {
      type: 'multipart',
    },
    handler: controller.updatePhoto,
  },
];
