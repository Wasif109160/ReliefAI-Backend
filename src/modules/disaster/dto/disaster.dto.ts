import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class CreateDisasterDto {
  @ApiProperty({ example: "2026 Surma River Basin Catastrophic Flash Flood" })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: "২০২৬ সুরমা নদী অববাহিকা আকস্মিক বন্যা" })
  @IsOptional()
  @IsString()
  banglaTitle?: string;

  @ApiProperty({ example: "flood" })
  @IsNotEmpty()
  @IsString()
  type!: string;

  @ApiProperty({ example: "critical" })
  @IsNotEmpty()
  @IsString()
  severity!: string;

  @ApiPropertyOptional({ example: "active" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: "live" })
  @IsOptional()
  @IsString()
  dataSource?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDemo?: boolean;

  @ApiProperty()
  @IsNotEmpty()
  location!: {
    name?: string;
    division?: string;
    district?: string;
    lat: number;
    lng: number;
  };

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  affectedPopulation?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  casualtiesReported?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  respondersDeployed?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  recommendedEvacuationRadiusKm?: number;

  @ApiPropertyOptional()
  @IsOptional()
  activeHazards?: string[];
}
