import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { getJwtSecret } from "./auth.constants";
import { AuthSession } from "./entities/auth-session.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthSession]),
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: getJwtSecret(),
      signOptions: { expiresIn: "15m" },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
