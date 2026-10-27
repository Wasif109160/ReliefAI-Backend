import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ResponderTeam } from "./entities/responder.entity";
import { ResponderService } from "./responder.service";
import { ResponderController } from "./responder.controller";

@Module({
  imports: [TypeOrmModule.forFeature([ResponderTeam])],
  controllers: [ResponderController],
  providers: [ResponderService],
  exports: [ResponderService],
})
export class ResponderModule {}
