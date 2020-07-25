'use strict';

const _ = require('lodash');
const User = require('../../models/user');
const Operator = require('sequelize').Op;
const bcrypt = require('bcrypt');

/**
 * Get all registered users
 * @param ctx
 * @returns {Promise<void>}
 */
exports.getAll = async ctx => {
    ctx.body = await User.findAll({
        where: {deleted_at: null},
        raw: true,
        attributes: {
            exclude: ['password', 'deleted_at']
        }
    });
    ctx.assert(null, 400, 'Request ditolak')
    ctx.throw(500, 'admin salah masukin file')
};

exports.createUser = async ctx => {
    const {fullname, username, email, password} = ctx.request.body;
    const find = await User.findOne({
        where: {
            [Operator.or]: {
                username,
                email
            },
        }
    })
    if (find) {
        ctx.throw(403, 'user with that username/email already exist')
    }
    const p = bcrypt.hashSync(password, 10);
    const res = await User.create({
        full_name: fullname,
        username,
        email,
        password: p
    })
    delete res.dataValues.password;
    delete res.dataValues.deleted_at;
    ctx.body = res;
};
