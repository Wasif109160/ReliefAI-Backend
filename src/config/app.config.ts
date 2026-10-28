import z, { ZodError } from "zod";

import * as dotenv from "dotenv";
import { fromZodError } from "zod-validation-error";
dotenv.config();

export const envSchema = z
  .object({
    REDIS_HOST: z.string().default("localhost"),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_PASSWORD: z.string().optional(),
    DEBUG_LOG: z.coerce.boolean().default(false),
    WARN_LOG: z.coerce.boolean().default(true),
    ERROR_LOG: z.coerce.boolean().default(true),
    REQ_LOG: z.coerce.boolean().default(true),
    LOG_FILE: z.coerce.boolean().default(true),
    JWT_BEARER_SECRET: z
      .string()
      .default(
        process.env.NODE_ENV === "production"
          ? ""
          : "dev_reliefai_jwt_secret_key_at_least_32_characters_long",
      )
      .refine(
        (val) => {
          if (process.env.NODE_ENV === "production") {
            return (
              !!val &&
              val.length >= 32 &&
              val !== "ffarrfafraerfeffgfgfgfgfgfgr" &&
              !val.includes("change-in-production")
            );
          }
          return true;
        },
        {
          message:
            "Production requires a strong, unique JWT_BEARER_SECRET of at least 32 characters. Insecure fallbacks are rejected.",
        },
      ),
    AUTH_SERVER_AUDIENCE: z.string().optional(),
    JWT_TTL: z.coerce.number().default(86400 * 365),
    PORT: z.coerce.number().default(5001),
    NODE_ENV: z.string().default("development"),
    APP_ENV: z.string().default("local"),
    MAILER_HOST: z.string().optional().default("localhost"),
    MAILER_PORT: z.coerce.number().optional().default(587),
    MAILER_SECURE: z.coerce.boolean().optional().default(false),
    MAILER_USER: z.string().optional().default(""),
    MAILER_PASSWORD: z.string().optional().default(""),
    MAILER_FROM: z.string().optional().default("no-reply@relief.ai"),
    BULB_REWARD_INTERVAL_SECOND: z.coerce.number().default(7 * 86400),
    BLOCK_QUERY_INTERVAL: z.coerce.number().default(10000),
    LONG_BREAK_THRESHOLD_IN_SECONDS: z.coerce.number().default(18 * 60 * 60), // 18Hours
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    RTC_PORT_MIN: z.coerce.number().default(10000),
    RTC_PORT_MAX: z.coerce.number().default(10100),
    NETWORK_NAME: z.string().default("mainnet"),
    CHAIN_ID: z.coerce.number().default(1),
    PRIVATE_KEY: z.string().optional(),
  })
  .transform((envs) => {
    return {
      ...envs,
      REDIS_URL:
        process.env.REDIS_URL ||
        (envs.REDIS_PASSWORD
          ? `redis://:${envs.REDIS_PASSWORD}@${envs.REDIS_HOST}:${envs.REDIS_PORT}`
          : `redis://${envs.REDIS_HOST}:${envs.REDIS_PORT}`),
    };
  });

const env = (() => {
  try {
    return envSchema.parse(
      Object.entries(process.env).reduce(
        (prev, [key, val]) => ({
          ...prev,
          [key]: (() => {
            try {
              if (val) return JSON.parse(val);
              return val;
            } catch (error) {
              return val;
            }
          })(),
        }),
        {},
      ),
    );
  } catch (error) {
    if (error instanceof ZodError)
      throw new Error(`ENV ${fromZodError(error).message}`);
    else throw new Error(`ENV ${error}`);
  }
})();

export const appConfig = {
  default_schema_identifier: "public",
  default_migrations_folder: __dirname + "/../database/migrations",
  default_seeders_folder: __dirname + "/../database/seeders",
  tenant_migrations_folder: __dirname + "/../database/tenant_migrations",
  tenant_seeders_folder: __dirname + "/../database/tenant_seeders",
  recommended_bycrypt_rounds: 12,
  email_from: "mailer@schmserver.com",
  env,
};
