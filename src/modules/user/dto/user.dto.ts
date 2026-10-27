import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "Admin ReliefAI", description: "Full name of the user" })
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "admin@reliefai.org", description: "Unique email address" })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "SecretPassword123!", description: "User password" })
  @IsNotEmpty()
  @MinLength(6)
  password!: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: "Admin ReliefAI Updated", description: "Updated full name" })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: "newadmin@reliefai.org", description: "Updated email" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "NewSecretPassword123!", description: "Updated password" })
  @IsOptional()
  @MinLength(6)
  password?: string;
}
