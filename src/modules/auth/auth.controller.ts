import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from "./dto/auth.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { Response, Request } from "express";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @ApiOperation({ summary: "Register a new user account" })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(dto);
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      false,
      result.refreshExpiresAt,
    );
    return result;
  }

  @Post("login")
  @ApiOperation({ summary: "Authenticate with email and password" })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      dto.rememberMe,
      result.refreshExpiresAt,
    );
    return result;
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get("me")
  @ApiOperation({ summary: "Get current authenticated user profile" })
  async getProfile(@Req() req: any) {
    return await this.authService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch("profile")
  @ApiOperation({ summary: "Update current authenticated user profile" })
  async updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return await this.authService.updateProfile(req.user.id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Post("change-password")
  @ApiOperation({ summary: "Change account password" })
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return await this.authService.changePassword(req.user.id, dto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Refresh JWT access token" })
  async refresh(
    @Req() req: Request,
    @Body("refreshToken") bodyToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken =
      bodyToken || (req.cookies && req.cookies.reliefai_refresh_token);

    const result = await this.authService.refreshToken(refreshToken);
    this.setAuthCookies(
      res,
      result.accessToken,
      result.refreshToken,
      false,
      result.refreshExpiresAt,
    );
    return result;
  }

  @Post("logout")
  @ApiOperation({ summary: "Log out and clear session cookies" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.reliefai_refresh_token);
    res.clearCookie("reliefai_access_token", { path: "/" });
    res.clearCookie("reliefai_refresh_token", { path: "/" });
    return { success: true, message: "Logged out successfully" };
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    rememberMe = false,
    refreshExpiresAt?: string,
  ) {
    const isProd = process.env.NODE_ENV === "production";
    const refreshMaxAge = refreshExpiresAt
      ? Math.max(0, new Date(refreshExpiresAt).getTime() - Date.now())
      : rememberMe
        ? 30 * 24 * 60 * 60 * 1000
        : 7 * 24 * 60 * 60 * 1000;

    res.cookie("reliefai_access_token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("reliefai_refresh_token", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: refreshMaxAge,
    });
  }
}
