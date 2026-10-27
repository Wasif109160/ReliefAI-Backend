import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsEmail, IsEnum, IsBoolean } from "class-validator";
import { Role } from "@/common/enums/role.enum";

export class UpdateUserRoleStatusDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedZone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;
}

export class ProvisionUserDto {
  @ApiProperty({ example: "Capt. Rehan Ahmed" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "rehan@fire-service.gov.bd" })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: Role, default: Role.RESCUE_TEAM })
  @IsNotEmpty()
  @IsEnum(Role)
  role!: Role;

  @ApiProperty({ example: "Fire Service & Civil Defence (FSCD)" })
  @IsNotEmpty()
  @IsString()
  organization!: string;

  @ApiPropertyOptional({ example: "FSCD-DIV-891" })
  @IsOptional()
  @IsString()
  badgeNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedTeamId?: string;

  @ApiProperty({ example: "Sylhet Division Zone 1" })
  @IsNotEmpty()
  @IsString()
  assignedZone!: string;

  @ApiPropertyOptional({ example: "+880 1711-223344" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: "Temp@Rescue123" })
  @IsOptional()
  @IsString()
  temporaryPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  skills?: string[];
}
