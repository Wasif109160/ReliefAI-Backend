import {
  DefaultNamingStrategy,
  NamingStrategyInterface,
} from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { camelCase, snakeCase } from "typeorm/util/StringUtils";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Snake naming will be used in database operations
 */
export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  tableName(className: string, customName: string): string {
    if (customName) return customName;
    const snakeCasedClassName = snakeCase(className);
    const splittedClassName = snakeCasedClassName.split("_");
    const lastWord = splittedClassName[splittedClassName.length];
    switch (lastWord) {
      case "status":
        return `${snakeCasedClassName}es`;
      default:
        return `${snakeCasedClassName}s`;
    }
  }

  columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    return (
      snakeCase(embeddedPrefixes.join("_")) +
      (customName || snakeCase(propertyName))
    );
  }

  relationName(propertyName: string): string {
    return camelCase(propertyName, true);
  }

  joinColumnName(relationName: string, referencedColumnName: string): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return snakeCase(
      `${firstTableName}_${firstPropertyName.replace(
        /\./gi,
        "_",
      )}_${secondTableName}`,
    );
  }

  joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(`${tableName}_${columnName || propertyName}`);
  }

  classTableInheritanceParentColumnName(
    parentTableName: string,
    parentTableIdPropertyName: string,
  ): string {
    return snakeCase(`${parentTableName}_${parentTableIdPropertyName}`);
  }
}

const isProduction = process.env.NODE_ENV === "production";

// Support both DATABASE_URL (standard on Render/Heroku/Neon/Supabase) and individual parameters
const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_EXTERNAL_URL;
const dbHost = process.env.DB_HOST || "localhost";
const isLocalhost =
  (!databaseUrl && (dbHost === "localhost" || dbHost === "127.0.0.1")) ||
  (!!databaseUrl && (databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1")));

// SSL Configuration: Render PostgreSQL requires SSL connection
const sslRequired =
  process.env.DB_SSL === "true" ||
  (process.env.DB_SSL !== "false" && !isLocalhost && (isProduction || !!databaseUrl));

// Schema Synchronization: Default to false in production to safeguard existing data; true in dev
const defaultSync = !isProduction;
const isSyncEnabled =
  process.env.DB_SYNCHRONIZE !== undefined
    ? process.env.DB_SYNCHRONIZE === "true"
    : defaultSync;

export const dataSourceOptions: PostgresConnectionOptions = {
  type: "postgres",
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: dbHost,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "1234",
        database: process.env.DB_DATABASE || "reliefe",
      }),
  schema: "public",
  ssl: sslRequired ? { rejectUnauthorized: false } : false,
  entities: [__dirname + "/../modules/**/entities/*.entity.{ts,js}"],
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [__dirname + "/../database/migrations/*.{ts,js}"],
  logging: process.env.DB_LOGGING === "true",
  synchronize: isSyncEnabled,
};

export default dataSourceOptions;
