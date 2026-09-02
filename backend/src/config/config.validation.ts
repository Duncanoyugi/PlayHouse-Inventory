import * as Joi from 'joi';

const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRATION: Joi.string().default('7d'),
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  API_PREFIX: Joi.string().default('/api'),
  API_VERSION: Joi.string().default('v1'),
});

export default configValidationSchema;

export const validateConfig = (
  config: Record<string, unknown>,
): Record<string, unknown> => {
  const { error, value } = configValidationSchema.validate(config, {
    abortEarly: true,
    allowUnknown: true,
  });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
};
