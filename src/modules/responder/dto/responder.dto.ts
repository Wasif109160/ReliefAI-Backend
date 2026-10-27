import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from "class-validator";

const VALID_STATUSES = ["available", "dispatched", "en_route", "on_scene", "off_duty"] as const;

export class CreateResponderDto {
  @ApiProperty({ example: "FSCD Sylhet Swift-Water Dive Team 1" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "Major Tariqul Islam" })
  @IsNotEmpty()
  @IsString()
  leadName!: string;

  @ApiProperty({ example: "swift_water" })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @IsNumber()
  membersCount?: number;

  @ApiPropertyOptional({ default: "available", enum: VALID_STATUSES })
  @IsOptional()
  @IsIn(VALID_STATUSES)
  status?: string;

  @ApiProperty()
  @IsNotEmpty()
  currentLocation!: {
    name?: string;
    lat: number;
    lng: number;
  };

  @ApiPropertyOptional({ default: "156.800 MHz (VHF Ch 16)" })
  @IsOptional()
  @IsString()
  radioFreq?: string;

  @ApiPropertyOptional()
  @IsOptional()
  equipment?: string[];
}

export class UpdateResponderStatusDto {
  @ApiPropertyOptional({ example: "team-01" })
  @IsOptional()
  @IsString()
  teamId?: string;

  @ApiProperty({ example: "on_scene", enum: VALID_STATUSES })
  @IsNotEmpty()
  @IsIn(VALID_STATUSES)
  status!: string;
}
