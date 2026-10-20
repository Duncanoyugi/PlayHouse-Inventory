import * as Joi from 'joi';

const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRATION: Joi.string().default('12h'),
  // In production the allowed browser origins MUST be listed explicitly.
  CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
  SWAGGER_ENABLED: Joi.boolean().default(false),
  TRUST_PROXY: Joi.number().default(1),
  BCRYPT_ROUNDS: Joi.number().min(10).max(15).default(12),
  THROTTLE_LIMIT: Joi.number().default(200),
  API_PREFIX: Joi.string().default('/api'),
  API_VERSION: Joi.string().default('v1'),
});

export default configValidationSchema;

export const validateConfig = (config: Record<string, unknown>): Record<string, unknown> => {
  const { error, value } = configValidationSchema.validate(config, {
    abortEarly: false,
    allowUnknown: true,
  });

  // In production the allowed browser origins MUST be listed explicitly.
  if (config.NODE_ENV === 'production' && !config.CORS_ORIGIN) {
    throw new Error('Config validation error: CORS_ORIGIN is required in production');
  }

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
};
