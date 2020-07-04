'use strict';

const joi = require('joi');

/**
 * Generate a validation schema using joi to check the type of your environment variables
 */
const envSchema = joi
  .object({
    NODE_ENV: joi.string().allow(['development', 'production', 'test']),
    APP_NAME: joi.string(),
    API_URL: joi.string(),
    PORT: joi.number(),
    API_VERSION: joi.string(),
    DIR_COMBINED_LOG: joi.string(),
    DIR_ERROR_LOG: joi.string(),
  })
  .unknown()
  .required();

/**
 * Validate the env variables using joi.validate()
 */
const { error, value: envVars } = joi.validate(process.env, envSchema);
if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  appName: envVars.APP_NAME,
  apiUrl: `${envVars.API_URL}:${envVars.PORT}` || '',
  isTest: envVars.NODE_ENV === 'test',
  isDevelopment: envVars.NODE_ENV === 'development',
  server: {
    port: envVars.PORT || 3000,
    apiVersion: envVars.API_VERSION || 'v1',
  },
  logger: {
    combined: envVars.DIR_COMBINED_LOG,
    error: envVars.DIR_ERROR_LOG,
  },
};

module.exports = config;
