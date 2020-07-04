'use strict';

const joi = require('joi');

/**
 * Generate a validation schema using joi to check the type of your environment variables
 */
const envSchema = joi
  .object({
    JWT_ALGORITHM: joi.string(),
    JWT_TYPE: joi.string(),
    JWT_SECRET: joi.string(),
    JWT_REFRESH_SECRET: joi.string(),
    JWT_EXPIRES: joi.number(),
    JWT_REFRESH_EXPIRES: joi.number(),
    USER_FIELDS: joi.string(),
    CIPHER_ALGORITHM: joi.string(),
    CIPHER_PASSWORD: joi.string(),
    VALIDITY: joi.number(),
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
  auth: {
    jwt: {
      algorithm: envVars.JWT_ALGORITHM,
      type: envVars.JWT_TYPE,
      secret: envVars.JWT_SECRET,
      refreshSecret: envVars.JWT_REFRESH_SECRET,
      expires: envVars.JWT_EXPIRES,
      refresh_expires: envVars.JWT_REFRESH_EXPIRES,
    },
    userFields: envVars.USER_FIELDS.split(',') || [],
    cipherAlgorithm: envVars.CIPHER_ALGORITHM,
    cipherPassword: envVars.CIPHER_PASSWORD,
    validity: envVars.VALIDITY,
  },
};

module.exports = config;
