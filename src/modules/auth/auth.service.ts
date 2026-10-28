import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { randomUUID, createHash } from "crypto";
import { AuthSession } from "./entities/auth-session.entity";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { User } from "@/modules/user/entities/user.entity";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from "./dto/auth.dto";
import { Role } from "@/common/enums/role.enum";
import {
  getJwtSecret,
  getJwtRefreshSecret,
  JWT_ISSUER,
  JWT_AUDIENCE,
} from "./auth.constants";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    if (dto.role && dto.role !== Role.CITIZEN) {
      throw new BadRequestException(
        "Privileged accounts must be provisioned by an administrator",
      );
    }
    const existing = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException("User with this email already exists");
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = this.userRepository.create({
      name: dto.name,
      displayName: dto.name,
      email: dto.email.toLowerCase().trim(),
      password: hashedPassword,
      role: Role.CITIZEN,
      phone: dto.phone,
      organization: dto.organization,
      badgeNumber: dto.badgeNumber,
      assignedZone: dto.assignedZone,
      isEmailVerified: false,
      status: "approved",
    });

    const savedUser = await this.userRepository.save(user);

    const tokens = await this.generateTokens(savedUser);
    const { password, ...userWithoutPassword } = savedUser;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("LOWER(user.email) = :email", { email: cleanEmail })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    let isMatch = false;
    try {
      isMatch = await argon2.verify(user.password, dto.password);
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      throw new UnauthorizedException("Invalid email or password");
    }

    if (user.status !== "approved")
      throw new UnauthorizedException("Account is not active");

    const tokens = await this.generateTokens(user, dto.rememberMe);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }
    return { user };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    Object.assign(user, dto);
    const updated = await this.userRepository.save(user);
    return { user: updated };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.id = :id", { id: userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isMatch = await argon2.verify(user.password, dto.currentPassword);
    if (!isMatch) {
      throw new BadRequestException("Current password does not match");
    }

    const password = await argon2.hash(dto.newPassword);
    await this.userRepository.manager.transaction(async (manager) => {
      await manager.update(User, userId, { password });
      await manager.update(AuthSession, { userId }, { revokedAt: new Date() });
    });

    return { message: "Password updated successfully" };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: getJwtRefreshSecret(),
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      if (payload.tokenType !== "refresh" || !payload.sessionId || !payload.sub)
        throw new Error("Invalid token");
      const result = await this.userRepository.manager.transaction(
        async (manager) => {
          const session = await manager
            .getRepository(AuthSession)
            .createQueryBuilder("session")
            .addSelect("session.refreshTokenHash")
            .setLock("pessimistic_write")
            .where("session.id = :id", { id: payload.sessionId })
            .getOne();
          if (
            !session ||
            session.userId !== payload.sub ||
            session.revokedAt ||
            session.expiresAt <= new Date()
          )
            return null;
          if (session.refreshTokenHash !== this.hashToken(refreshToken)) {
            // Commit revocation before reporting reuse; throwing here would roll it back.
            await manager.update(AuthSession, session.id, {
              revokedAt: new Date(),
            });
            return null;
          }
          const user = await manager.findOneBy(User, { id: payload.sub });
          if (!user || user.status !== "approved") return null;
          const tokens = this.signTokens(user, session.id, session.expiresAt);
          await manager.update(AuthSession, session.id, {
            refreshTokenHash: this.hashToken(tokens.refreshToken),
          });
          return { user, ...tokens };
        },
      );
      if (!result) throw new Error("Session revoked or expired");
      return result;
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private async generateTokens(user: User, rememberMe = false) {
    return this.userRepository.manager.transaction(async (manager) => {
      // Serialize with password/role/status changes before creating a new session.
      const current = await manager
        .getRepository(User)
        .createQueryBuilder("user")
        .addSelect("user.password")
        .setLock("pessimistic_write")
        .where("user.id = :id", { id: user.id })
        .getOne();
      if (
        !current ||
        current.status !== "approved" ||
        (user.password && user.password !== current.password)
      ) {
        throw new UnauthorizedException(
          "Account credentials changed; please sign in again",
        );
      }
      const sessionId = randomUUID();
      const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 86400000);
      const tokens = this.signTokens(current, sessionId, expiresAt);
      await manager.save(AuthSession, {
        id: sessionId,
        userId: current.id,
        refreshTokenHash: this.hashToken(tokens.refreshToken),
        expiresAt,
        revokedAt: null,
      });
      return tokens;
    });
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: getJwtRefreshSecret(),
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      });
      if (payload.tokenType === "refresh" && payload.sessionId && payload.sub) {
        await this.userRepository.manager.update(
          AuthSession,
          { id: payload.sessionId, userId: payload.sub },
          { revokedAt: new Date() },
        );
      }
    } catch (error) {
      // Invalid/expired JWTs are already unusable. Database failures must surface.
      if (
        error instanceof Error &&
        !["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"].includes(
          error.name,
        )
      )
        throw error;
    }
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private signTokens(user: User, sessionId: string, expiresAt: Date) {
    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionId,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
      secret: getJwtSecret(),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: "HS256",
      jwtid: randomUUID(),
    });

    const refreshToken = this.jwtService.sign(
      {
        ...payload,
        tokenType: "refresh",
        exp: Math.floor(expiresAt.getTime() / 1000),
      },
      {
        secret: getJwtRefreshSecret(),
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        algorithm: "HS256",
        jwtid: randomUUID(),
      },
    );

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt: expiresAt.toISOString(),
    };
  }
}
