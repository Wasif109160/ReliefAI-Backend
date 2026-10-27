import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsIn } from "class-validator";

export class CreateSupplyDto {
  @ApiProperty({ example: "Clean Water Purifying Tablets" })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: "water" })
  @IsNotEmpty()
  @IsString()
  category!: string;

  @ApiProperty({ example: 12000 })
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;

  @ApiProperty({ example: "strips" })
  @IsNotEmpty()
  @IsString()
  unit!: string;

  @ApiProperty({ example: "Sylhet Central Disaster Relief Hub" })
  @IsNotEmpty()
  @IsString()
  warehouseLocation!: string;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  threshold?: number;
}

export class UpdateSupplyActionDto {
  @ApiProperty({ example: "dispatch", enum: ["dispatch", "restock"] })
  @IsNotEmpty()
  @IsIn(["dispatch", "restock"])
  action!: "dispatch" | "restock";

  @ApiProperty({ example: "supply-01" })
  @IsNotEmpty()
  @IsString()
  id!: string;

  @ApiProperty({ example: 500 })
  @IsNotEmpty()
  @IsNumber()
  quantity!: number;
}
