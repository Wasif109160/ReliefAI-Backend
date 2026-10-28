import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsInt,
  Min,
} from "class-validator";

export class CreateSosDto {
  @ApiProperty({ example: "Rafiqul Islam" })
  @IsNotEmpty()
  @IsString()
  reporterName!: string;

  @ApiProperty({ example: "+880 1712-345678" })
  @IsNotEmpty()
  @IsString()
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  disasterId?: string;

  @ApiProperty()
  @IsNotEmpty()
  location!: {
    address?: string;
    lat: number;
    lng: number;
  };

  @ApiProperty({
    example:
      "Surma flash floodwaters reached rooftop! Need boat extraction immediately.",
  })
  @IsNotEmpty()
  @IsString()
  details!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  trappedCount?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  injuriesCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  specialNeeds?: string[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  needsBoat?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  needsMedical?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  needsFoodWater?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  urgencyScore?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  priority?: string;
}

export class DispatchSosDto {
  @ApiProperty({ example: "team-01" })
  @IsNotEmpty()
  @IsString()
  teamId!: string;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsInt()
  @Min(1)
  etaMinutes?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
