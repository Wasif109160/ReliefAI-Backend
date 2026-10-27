import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Disaster } from "./entities/disaster.entity";
import { DisasterService } from "./disaster.service";
import { DisasterController } from "./disaster.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Disaster])],
  controllers: [DisasterController],
  providers: [DisasterService],
  exports: [DisasterService],
})
export class DisasterModule {}
