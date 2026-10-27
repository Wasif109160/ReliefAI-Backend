import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Role } from "@/common/enums/role.enum";

export class RegisterDto {
  @ApiProperty({ example: "Wasif Rahman" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "wasif@relief.ai" })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "SecurePass123!" })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ enum: Role, default: Role.CITIZEN })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ example: "+880 1712-345678" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Bangladesh Red Crescent" })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional({ example: "BDRCS-VOL-2026-089" })
  @IsOptional()
  @IsString()
  badgeNumber?: string;

  @ApiPropertyOptional({ example: "Sylhet Sadar" })
  @IsOptional()
  @IsString()
  assignedZone?: string;
}

export class LoginDto {
  @ApiProperty({ example: "admin@relief.ai" })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "AdminPass123!" })
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  rememberMe?: boolean;
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  currentPassword!: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  newPassword!: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedZone?: string;
}
