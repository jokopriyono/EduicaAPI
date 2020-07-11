'use strict';

const joi = require('joi');

const controller = require('./user.controller');

module.exports = opts => [
    {
        method: 'get',
        path: opts.baseUrl + '/',
        handler: controller.getAll,
    },
    {
        method: 'post',
        path: opts.baseUrl + '/',
        validate: {
            type: 'json',
            body: {
                fullname: joi
                    .string()
                    .max(255)
                    .required(),
                username: joi
                    .string()
                    .max(100)
                    .required(),
                email: joi
                    .string()
                    .email()
                    .max(255)
                    .required(),
                password: joi.string().max(255).required(),
            },
        },
        handler: controller.createUser,
    },
    // {
    //   method: 'put',
    //   path: opts.baseUrl + '/:userId',
    //   validate: {
    //     type: 'json',
    //     body: {
    //       fullName: joi
    //         .string()
    //         .max(100)
    //         .optional(),
    //       phone: joi
    //         .string()
    //         .max(20)
    //         .optional(),
    //       gender: joi
    //         .number()
    //         .valid([0, 1])
    //         .optional(),
    //       email: joi
    //         .string()
    //         .email()
    //         .max(50)
    //         .optional(),
    //       password: joi.string().optional(),
    //     },
    //   },
    //   handler: controller.update,
    // },
    // {
    //   method: 'delete',
    //   path: opts.baseUrl + '/:userId',
    //   handler: controller.delete,
    // },
];
