import { dataSourceOptions } from "@/config/.";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

const migrateRun = async () => {
  console.log(`Migrating.....`);
  const ds = new DataSource({
    ...dataSourceOptions,
  } as PostgresConnectionOptions);
  try {
    await ds.initialize();
    const migrations = await ds.runMigrations();
    console.log(
      "Migration completed successfully:",
      migrations.map((m) => m.name),
    );
    await ds.destroy();
    process.exit(0);
  } catch (err) {
    console.error("Migration error:", err);
    await ds.destroy().catch(() => {});
    process.exit(1);
  }
};

migrateRun();
