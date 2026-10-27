import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NgoApplication } from "./entities/ngo-application.entity";
import { User } from "@/modules/user/entities/user.entity";
import { NgoApplicationService } from "./ngo-application.service";
import { NgoApplicationController } from "./ngo-application.controller";

@Module({
  imports: [TypeOrmModule.forFeature([NgoApplication, User])],
  controllers: [NgoApplicationController],
  providers: [NgoApplicationService],
  exports: [NgoApplicationService],
})
export class NgoApplicationModule {}
