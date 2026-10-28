import "reflect-metadata";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "@/config/database.config";
import { User } from "@/modules/user/entities/user.entity";
import { Role } from "@/common/enums/role.enum";
import * as argon2 from "argon2";

async function bootstrap() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error(
      "Set BOOTSTRAP_ADMIN_EMAIL and a unique BOOTSTRAP_ADMIN_PASSWORD of at least 12 characters",
    );
  const ds = new DataSource({ ...dataSourceOptions, synchronize: false });
  await ds.initialize();
  try {
    await ds.transaction(async (manager) => {
      // Serialize first-admin setup across concurrent processes.
      await manager.query("SELECT pg_advisory_xact_lock(1793200000)");
      const repo = manager.getRepository(User);
      if (
        await repo.exists({
          where: [{ role: Role.ADMIN }, { role: Role.SUPER_ADMIN }],
        })
      ) {
        throw new Error(
          "An administrator already exists; bootstrap will not overwrite credentials",
        );
      }
      if (await repo.exists({ where: { email } }))
        throw new Error("Email already belongs to an existing account");
      await repo.save(
        repo.create({
          email,
          name: process.env.BOOTSTRAP_ADMIN_NAME || "Platform Administrator",
          password: await argon2.hash(password),
          role: Role.SUPER_ADMIN,
          status: "approved",
          isEmailVerified: false,
        }),
      );
    });
    console.log(
      "Administrator created. Remove bootstrap credentials from the environment.",
    );
  } finally {
    await ds.destroy();
  }
}
bootstrap().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
