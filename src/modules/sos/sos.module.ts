import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SosRequest } from "./entities/sos.entity";
import { ResponderTeam } from "@/modules/responder/entities/responder.entity";
import { SosService } from "./sos.service";
import { SosController } from "./sos.controller";

@Module({
  imports: [TypeOrmModule.forFeature([SosRequest, ResponderTeam])],
  controllers: [SosController],
  providers: [SosService],
  exports: [SosService],
})
export class SosModule {}
