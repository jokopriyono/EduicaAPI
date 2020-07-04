const logger = require('../helpers/logger');

const { isDevelopment } = require('../config');

module.exports = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isDevelopment) {
      console.error(err);
    }
    if (err.status >= 500) logger.error({ message: 'Error handler:', err });
    ctx.status = err.status || 500;
    ctx.message = err.message || 'Internal server error';
    ctx.body = {
      code: err.status,
      status: 'FAILED',
      message: err.message || 'Internal server error',
    };
  }
};
