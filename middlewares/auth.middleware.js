const authHelper = require('../helpers/auth');
const logger = require('../helpers/logger');
const Application = require('../models/application');
const Login = require('../models/login');
const UserPermission = require('../models/user-permission');

const accessType = {
  read: ['GET'],
  write: ['POST', 'PUT', 'DELETE'],
};

const isResourceAllowed = (request, userPermissions) => {
  const urlSegments = request.url.split('/');
  let resource = urlSegments[3];
  resource = resource.split('?')[0];
  const method = request.method;

  const permission = userPermissions.find(function(obj) {
    return obj.dataValues.globalPermission.dataValues.route === resource;
  });
  if (permission) {
    if (
      (permission.dataValues.is_readable &&
        accessType.read.indexOf(method) > -1) ||
      (permission.dataValues.is_writeable &&
        accessType.write.indexOf(method) > -1)
    ) {
      return true;
    }
  }
  return false;
};

module.exports = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    let token;

    const apiKey = ctx.req.headers['x-api-key'];
    if (apiKey !== undefined) {
      const app = await Application.findOne({
        where: {
          key: apiKey,
          deleted_at: null,
        },
      });
      ctx.assert(app, 401);

      if (authHeader) {
        token = authHeader.split(' ')[1];
        const search = Login.findOne({
          where: {
            token,
            is_revoked: 0,
            deleted_at: null,
          },
        });
        if (!search) {
          ctx.throw(401, 'Token revoked, please re-login');
        }
      } else {
        token = ctx.request.body.refreshToken;
      }

      if (token) {
        const payload = await authHelper.validateToken(token);
        if (payload) {
          const iss = payload.iss;
          const userData = payload[iss];
          ctx.user = {
            id: userData['x-trackingkaryawan-user-id'],
            email: userData['x-trackingkaryawan-email'],
            phone: userData['x-trackingkaryawan-phone'],
            is_special: userData['x-trackingkaryawan-is-special'],
          };
          const permissions = await UserPermission.findAll({
            where: {
              deleted_at: null,
              user_id: ctx.user.id,
            },
          });
          if (permissions && isResourceAllowed(ctx.request, permissions)) {
            await next();
            return;
          }
        }
      }
    }
  } catch (error) {
    ctx.throw(500, error);
    logger.error({ message: 'Auth error:', error: error.stack });
  }

  ctx.throw(401, 'You cannot access this route');
};
