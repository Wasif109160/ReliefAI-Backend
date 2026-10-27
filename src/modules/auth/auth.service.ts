import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
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
      role: dto.role || Role.CITIZEN,
      phone: dto.phone,
      organization: dto.organization,
      badgeNumber: dto.badgeNumber,
      assignedZone: dto.assignedZone,
      isEmailVerified: true,
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

    user.password = await argon2.hash(dto.newPassword);
    await this.userRepository.save(user);

    return { message: "Password updated successfully" };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_BEARER_SECRET || "ffarrfafraerfeffgfgfgfgfgfgr",
      });

      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      const tokens = await this.generateTokens(user);
      return {
        user,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  private async generateTokens(user: User, rememberMe = false) {
    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: "15m",
      secret: process.env.JWT_BEARER_SECRET || "ffarrfafraerfeffgfgfgfgfgfgr",
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: rememberMe ? "30d" : "7d",
      secret: process.env.JWT_REFRESH_SECRET || process.env.JWT_BEARER_SECRET || "ffarrfafraerfeffgfgfgfgfgfgr",
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
