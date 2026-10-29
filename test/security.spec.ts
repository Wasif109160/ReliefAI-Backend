import "reflect-metadata";
import {
  describe,
  it,
  expect,
  jest,
  beforeAll,
  beforeEach,
  afterAll,
} from "@jest/globals";
import { Test } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { getRepositoryToken } from "@nestjs/typeorm";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthModule } from "../src/modules/auth/auth.module";
import request from "supertest";
import cookieParser from "cookie-parser";
import * as argon2 from "argon2";
import { User } from "../src/modules/user/entities/user.entity";
import { AuthSession } from "../src/modules/auth/entities/auth-session.entity";
import { AuthController } from "../src/modules/auth/auth.controller";
import { AuthService } from "../src/modules/auth/auth.service";
import { JwtStrategy } from "../src/modules/auth/jwt.strategy";
import { UserController } from "../src/modules/user/user.controller";
import { UserService } from "../src/modules/user/user.service";
import { SosController } from "../src/modules/sos/sos.controller";
import { SosService } from "../src/modules/sos/sos.service";
import { Role } from "../src/common/enums/role.enum";
import { randomUUID } from "crypto";

describe("HTTP authentication and authorization regressions", () => {
  let app: INestApplication;
  const users = new Map<string, any>();
  const sessions = new Map<string, any>();
  const publicUser = (u: any) =>
    u &&
    Object.fromEntries(Object.entries(u).filter(([k]) => k !== "password"));
  const sessionBuilder = () => {
    let id: string;
    const b: any = {
      addSelect: () => b,
      setLock: () => b,
      where: (_: string, args: any) => {
        id = args.id;
        return b;
      },
      getOne: async () => sessions.get(id) || null,
    };
    return b;
  };
  const userBuilder = () => {
    let args: any;
    const b: any = {
      addSelect: () => b,
      setLock: () => b,
      where: (_: string, a: any) => {
        args = a;
        return b;
      },
      getOne: async () =>
        Array.from(users.values()).find((u) =>
          args.id ? u.id === args.id : u.email === args.email,
        ) || null,
    };
    return b;
  };
  const manager: any = {
    transaction: async (fn: any) => fn(manager),
    getRepository: (entity: any) => ({
      createQueryBuilder: entity === AuthSession ? sessionBuilder : userBuilder,
    }),
    save: async (_: any, value: any) => {
      sessions.set(value.id, { ...value });
      return value;
    },
    findOneBy: async (entity: any, where: any) => {
      const v = (entity === AuthSession ? sessions : users).get(where.id);
      return v && (!where.userId || v.userId === where.userId)
        ? entity === User
          ? publicUser(v)
          : { ...v }
        : null;
    },
    update: async (entity: any, where: any, patch: any) => {
      const map = entity === AuthSession ? sessions : users;
      for (const [id, v] of map)
        if (
          typeof where === "string"
            ? id === where
            : Object.entries(where).every(([k, val]) => v[k] === val)
        )
          map.set(id, { ...v, ...patch });
    },
  };
  const repo: any = {
    manager,
    createQueryBuilder: userBuilder,
    create: (dto: any) => ({ id: randomUUID(), status: "approved", ...dto }),
    save: async (u: any) => {
      users.set(u.id, { ...u });
      return u;
    },
    findOne: async ({ where }: any) =>
      publicUser(
        Array.from(users.values()).find((u) =>
          Object.entries(where).every(([k, v]) => u[k] === v),
        ),
      ) || null,
  };
  const userService = {
    getUsers: jest.fn(async () => []),
    updateUser: jest.fn(async () => ({})),
    deleteUser: jest.fn(async () => ({})),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: "jwt" }),
        // Use the actual production JWT configuration to catch merged signing defaults.
        ...Reflect.getMetadata("imports", AuthModule).filter(
          (entry: any) => entry.module === JwtModule,
        ),
      ],
      controllers: [AuthController, UserController, SosController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: repo },
        { provide: UserService, useValue: userService },
        {
          provide: SosService,
          useValue: {
            getSosRequests: async () => [{ id: "sos-1", phone: "private" }],
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });
  beforeEach(async () => {
    users.clear();
    sessions.clear();
    jest.clearAllMocks();
    const password = await argon2.hash("TestPassword123!");
    for (const role of [Role.ADMIN, Role.CITIZEN]) {
      const id = randomUUID();
      users.set(id, {
        id,
        name: role,
        email: `${role}@test.local`,
        role,
        status: "approved",
        password,
      });
    }
  });
  afterAll(async () => app.close());
  const login = (role = "citizen") =>
    request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: `${role}@test.local`, password: "TestPassword123!" })
      .expect(201);

  it("blocks anonymous user listing, password update, and deletion before service execution", async () => {
    await request(app.getHttpServer()).get("/users").expect(401);
    await request(app.getHttpServer())
      .patch("/users/target")
      .send({ password: "Hijack123!" })
      .expect(401);
    await request(app.getHttpServer()).delete("/users/target").expect(401);
    expect(userService.updateUser).not.toHaveBeenCalled();
  });
  it("blocks a citizen from account administration but permits an administrator", async () => {
    const citizen = await login();
    await request(app.getHttpServer())
      .get("/users")
      .auth(citizen.body.accessToken, { type: "bearer" })
      .expect(403);
    const admin = await login("admin");
    await request(app.getHttpServer())
      .get("/users")
      .auth(admin.body.accessToken, { type: "bearer" })
      .expect(200);
  });
  it("rejects privileged public registration", async () => {
    for (const role of [Role.ADMIN, Role.SUPER_ADMIN, Role.NGO])
      await request(app.getHttpServer())
        .post("/auth/register")
        .send({
          name: "Attacker",
          email: "new@test.local",
          password: "TestPassword123!",
          role,
        })
        .expect(400);
    expect(users.size).toBe(2);
  });
  it("registers only an unverified citizen and emits the frontend JWT contract", async () => {
    const r = await request(app.getHttpServer())
      .post("/auth/register")
      .send({
        name: "New",
        email: "new@test.local",
        password: "TestPassword123!",
      })
      .expect(201);
    expect(r.body.user.role).toBe("citizen");
    expect(r.body.user.isEmailVerified).toBe(false);
    expect(r.body.user.password).toBeUndefined();
    const payload: any = new JwtService().decode(r.body.accessToken);
    expect(payload.iss).toBe("reliefai-auth");
    expect(payload.aud).toBe("reliefai-app");
    expect(payload.sessionId).toBeTruthy();
  });
  it("does not expose SOS PII to anonymous callers or citizens", async () => {
    await request(app.getHttpServer()).get("/sos").expect(401);
    const r = await login();
    await request(app.getHttpServer())
      .get("/sos")
      .auth(r.body.accessToken, { type: "bearer" })
      .expect(403);
  });
  it("issues 15-minute access tokens and preserves 7/30-day refresh expiry on rotation", async () => {
    const jwt = new JwtService();
    for (const rememberMe of [false, true]) {
      const r = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "citizen@test.local",
          password: "TestPassword123!",
          rememberMe,
        })
        .expect(201);
      const access: any = jwt.decode(r.body.accessToken);
      const refresh: any = jwt.decode(r.body.refreshToken);
      expect(access.exp - access.iat).toBe(900);
      expect(refresh.exp - refresh.iat).toBe((rememberMe ? 30 : 7) * 86400);
      const rotated = await request(app.getHttpServer())
        .post("/auth/refresh")
        .send({ refreshToken: r.body.refreshToken })
        .expect(201);
      expect((jwt.decode(rotated.body.refreshToken) as any).exp).toBe(
        refresh.exp,
      );
    }
  });
  it("logout revokes both access and refresh credentials", async () => {
    const r = await login();
    await request(app.getHttpServer())
      .post("/auth/logout")
      .set("Cookie", `reliefai_refresh_token=${r.body.refreshToken}`)
      .expect(201);
    await request(app.getHttpServer())
      .get("/auth/me")
      .auth(r.body.accessToken, { type: "bearer" })
      .expect(401);
    await request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: r.body.refreshToken })
      .expect(401);
  });
  it("refresh rotation rejects replay and revokes the session", async () => {
    const r = await login();
    const next = await request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: r.body.refreshToken })
      .expect(201);
    expect(next.body.refreshToken).not.toBe(r.body.refreshToken);
    await request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: r.body.refreshToken })
      .expect(401);
    await request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: next.body.refreshToken })
      .expect(401);
  });
  it("password changes invalidate every existing session", async () => {
    const r = await login();
    await request(app.getHttpServer())
      .post("/auth/change-password")
      .auth(r.body.accessToken, { type: "bearer" })
      .send({
        currentPassword: "TestPassword123!",
        newPassword: "ChangedPassword123!",
      })
      .expect(201);
    await request(app.getHttpServer())
      .post("/auth/refresh")
      .send({ refreshToken: r.body.refreshToken })
      .expect(401);
    await request(app.getHttpServer())
      .get("/auth/me")
      .auth(r.body.accessToken, { type: "bearer" })
      .expect(401);
  });
});
