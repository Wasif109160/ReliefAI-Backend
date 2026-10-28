import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { Request } from "express";
import { getJwtSecret } from "./auth.constants";
import { JWT_ISSUER, JWT_AUDIENCE } from "./auth.constants";
import { AuthSession } from "./entities/auth-session.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          if (!request) return null;
          // Check cookies first
          if (request.cookies && request.cookies.reliefai_access_token) {
            return request.cookies.reliefai_access_token;
          }
          // Check authorization header
          const authHeader = request.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
  }

  async validate(payload: any) {
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.status !== "approved") {
      throw new UnauthorizedException("User no longer exists");
    }
    if (!payload.sessionId) throw new UnauthorizedException("Session missing");
    const session = await this.userRepository.manager.findOneBy(AuthSession, {
      id: payload.sessionId,
      userId,
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date())
      throw new UnauthorizedException("Session expired or revoked");

    return user;
  }
}
