import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsIn } from "class-validator";

export class CreateNgoApplicationDto {
  @ApiProperty({ example: "Bangladesh Red Crescent Society (Sylhet Chapter)" })
  @IsNotEmpty()
  @IsString()
  organizationName!: string;

  @ApiProperty({ example: "NGO-REG-2026-BDRCS-049" })
  @IsNotEmpty()
  @IsString()
  registrationNumber!: string;

  @ApiProperty({ example: "Dr. Nazmul Huda" })
  @IsNotEmpty()
  @IsString()
  focalPersonName!: string;

  @ApiProperty({ example: "nazmul@bdrcs-sylhet.org" })
  @IsNotEmpty()
  @IsString()
  focalPersonEmail!: string;

  @ApiProperty({ example: "+880 1819-556677" })
  @IsNotEmpty()
  @IsString()
  focalPersonPhone!: string;

  @ApiPropertyOptional({ example: "https://bdrcs.org" })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ example: "Zindabazar, Sylhet Sadar" })
  @IsNotEmpty()
  @IsString()
  hqAddress!: string;

  @ApiProperty({ example: ["Sylhet", "Sunamganj"] })
  @IsNotEmpty()
  operationalDistricts!: string[];

  @ApiProperty({ example: ["swift_water_rescue", "emergency_medical"] })
  @IsNotEmpty()
  reliefCapabilities!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentData?: string;
}

export class ReviewNgoApplicationDto {
  @ApiProperty({ example: "approve", enum: ["approve", "reject"] })
  @IsNotEmpty()
  @IsIn(["approve", "reject"])
  action!: "approve" | "reject";

  @ApiPropertyOptional({ example: "Verified NGO accreditation with Ministry of Disaster Management." })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
