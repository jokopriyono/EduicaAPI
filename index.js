'use strict';

const http = require('http');

const logger = require('./helpers/logger');
const db = require('./services/db');
const server = require('./server');
const { server: serverConfig } = require('./config');
const fs = require('fs');
const appDir = require('path').dirname(require.main.filename);
const publicDirs = ['memos', 'profiles'];

async function bootstrap() {
  // connect to database server
  await db.authenticate();

  // create public folder
  for (const subDir of publicDirs) {
    const checkDir = `${appDir}/public/${subDir}/`;
    await fs.mkdir(checkDir, () => {});
  }

  // initiate the server
  return http.createServer(server.callback()).listen(serverConfig.port);
}

bootstrap()
  .then(server => {
    logger.info(`🚀 Server listening on port ${server.address().port}!`);
  })
  .catch(err => {
    setImmediate(() => {
      logger.error({
        message: 'Unable to run the server',
        error: err,
      });
      process.exit();
    });
  });
