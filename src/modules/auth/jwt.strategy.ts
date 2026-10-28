import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { Request } from "express";
import { getJwtSecret } from "./auth.constants";

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
    });
  }

  async validate(payload: any) {
    const userId = payload.sub || payload.userId || payload.id;
    if (!userId) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException("User no longer exists");
    }

    return user;
  }
}
