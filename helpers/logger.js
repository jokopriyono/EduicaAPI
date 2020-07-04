const stripAnsi = require('strip-ansi');
const { createLogger, format, transports } = require('winston');
const handlebars = require('handlebars');

const { logger: loggerConfig, env, isDevelopment } = require('../config');

const combinedLogFile = handlebars.compile(loggerConfig.combined)({ env });
const errorLogFile = handlebars.compile(loggerConfig.error)({ env });

// reformat log
const reformatLog = format((info, opts) => {
  info.message = opts.isSimple ? info.message : stripAnsi(info.message);

  // reformat if log contain args from request
  if (info.args) {
    if (!opts.isSimple) {
      const args = info.args;
      info.method = args[1];
      info.url = args[2];
      info.status = args[3];
      info.time = args[4];
      info.size = args[5];
    }

    delete info.args;
  }

  // add timestamps if format json
  if (!opts.isSimple) info.tme = new Date();

  return info;
});

// init log
const logger = createLogger({
  level: 'info',
  transports: [
    new transports.File({
      filename: errorLogFile,
      format: format.combine(reformatLog(), format.json()),
      level: 'error',
    }),
    new transports.File({
      filename: combinedLogFile,
      format: format.combine(reformatLog(), format.json()),
    }),
  ],
});

// if env is development output log as console
if (isDevelopment) {
  logger.add(
    new transports.Console({
      format: format.combine(reformatLog({ isSimple: true }), format.simple()),
    }),
  );
}

module.exports = logger;
