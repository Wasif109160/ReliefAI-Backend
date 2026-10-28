/**
 * Production-safe JWT secret retrieval helpers.
 * Insecure hardcoded fallbacks are strictly rejected in production environments.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_BEARER_SECRET;
  if (!secret || secret === "ffarrfafraerfeffgfgfgfgfgfgr") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL PRODUCTION CONFIG ERROR: JWT_BEARER_SECRET is required in production and cannot be an insecure fallback. Please provide a strong JWT_BEARER_SECRET (min 32 characters) in your environment variables.",
      );
    }
    return "dev_reliefai_jwt_secret_key_at_least_32_characters_long";
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "FATAL PRODUCTION CONFIG ERROR: JWT_BEARER_SECRET must be at least 32 characters long in production for security.",
    );
  }
  return secret;
}

export function getJwtRefreshSecret(): string {
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (refreshSecret && refreshSecret !== "ffarrfafraerfeffgfgfgfgfgfgr") {
    if (process.env.NODE_ENV === "production" && refreshSecret.length < 32) {
      throw new Error(
        "FATAL PRODUCTION CONFIG ERROR: JWT_REFRESH_SECRET must be at least 32 characters long in production for security.",
      );
    }
    return refreshSecret;
  }
  return getJwtSecret();
}
