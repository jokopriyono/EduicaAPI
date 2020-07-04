'use strict';

const joi = require('joi');

const controller = require('./user.controller');

const userPermissionObj = joi.object({
  id: joi.number().required(),
  isReadable: [
    joi
      .number()
      .valid([0, 1])
      .required(),
    joi.boolean().required(),
  ],
  isWriteable: [
    joi
      .number()
      .valid([0, 1])
      .required(),
    joi.boolean().required(),
  ],
});

module.exports = opts => [
  {
    method: 'get',
    path: opts.baseUrl + '/',
    handler: controller.getAll,
  },
  {
    method: 'get',
    path: opts.baseUrl + '/:userId',
    handler: controller.get,
  },
  {
    method: 'post',
    path: opts.baseUrl + '/',
    validate: {
      type: 'json',
      body: {
        fullName: joi
          .string()
          .max(100)
          .required(),
        phone: joi
          .string()
          .max(20)
          .optional(),
        gender: joi
          .number()
          .valid([0, 1])
          .required(),
        email: joi
          .string()
          .email()
          .max(50)
          .required(),
        password: joi.string().required(),
      },
    },
    handler: controller.create,
  },
  {
    method: 'put',
    path: opts.baseUrl + '/:userId',
    validate: {
      type: 'json',
      body: {
        fullName: joi
          .string()
          .max(100)
          .optional(),
        phone: joi
          .string()
          .max(20)
          .optional(),
        gender: joi
          .number()
          .valid([0, 1])
          .optional(),
        email: joi
          .string()
          .email()
          .max(50)
          .optional(),
        password: joi.string().optional(),
      },
    },
    handler: controller.update,
  },
  {
    method: 'delete',
    path: opts.baseUrl + '/:userId',
    handler: controller.delete,
  },
];
