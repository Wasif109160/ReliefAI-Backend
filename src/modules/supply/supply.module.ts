import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SupplyItem } from "./entities/supply.entity";
import { SupplyService } from "./supply.service";
import { SupplyController } from "./supply.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SupplyItem])],
  controllers: [SupplyController],
  providers: [SupplyService],
  exports: [SupplyService],
})
export class SupplyModule {}
