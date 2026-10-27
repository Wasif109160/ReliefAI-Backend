import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber } from "class-validator";

export class CreateDonationDto {
  @ApiPropertyOptional({ example: "Anonymous Humanitarian" })
  @IsOptional()
  @IsString()
  donorName?: string;

  @ApiPropertyOptional({ example: "donor@example.com" })
  @IsOptional()
  @IsString()
  donorEmail?: string;

  @ApiProperty({ example: 5000 })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({ example: "BDT", default: "BDT" })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ example: "Emergency Flash Flood Relief & Baby Food" })
  @IsOptional()
  @IsString()
  allocatedCause?: string;

  @ApiPropertyOptional({ example: "bKash" })
  @IsOptional()
  @IsString()
  channel?: string;
}
