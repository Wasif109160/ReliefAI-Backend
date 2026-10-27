import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from "class-validator";

export class CreateShelterDto {
  @ApiProperty({ example: "Sylhet Multi-Purpose Cyclone & Flood Shelter" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "Gowainghat Upazila Complex, Sylhet" })
  @IsNotEmpty()
  @IsString()
  address!: string;

  @ApiProperty({ example: 25.076 })
  @IsNotEmpty()
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 91.975 })
  @IsNotEmpty()
  @IsNumber()
  lng!: number;

  @ApiProperty({ example: 850 })
  @IsNotEmpty()
  @IsNumber()
  capacity!: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  currentOccupancy?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasMedical?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasFood?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasWater?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  hasPower?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPetFriendly?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  hasSupplies?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  managedByNGO?: string;
}

export class UpdateOccupancyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ example: 420 })
  @IsNotEmpty()
  @IsNumber()
  currentOccupancy!: number;
}
