const Koa = require('koa');
const bodyParser = require('koa-bodyparser')();
const compress = require('koa-compress')();
const cors = require('@koa/cors')(/* Add your cors option */);
const helmet = require('koa-helmet')(/* Add your security option */);
const logger = require('koa-logger');

const responseHandler = require('./middlewares/response.middleware');
const errorHandler = require('./middlewares/error.middleware');
const applyApiMiddleware = require('./api');
const { isDevelopment } = require('./config');
const appLogger = require('./helpers/logger');

const server = new Koa();

/**
 * Add here only development middlewares
 */
if (isDevelopment) {
  server.use(
    logger((str, args) => {
      appLogger.log({ level: 'info', message: str, args });
    }),
  );
}

/**
 * Pass to our server instance middlewares
 */
server
  .use(errorHandler)
  .use(helmet)
  .use(compress)
  .use(cors)
  .use(bodyParser)
  .use(responseHandler);

/**
 * Apply to our server the api router
 */
applyApiMiddleware(server);

module.exports = server;
