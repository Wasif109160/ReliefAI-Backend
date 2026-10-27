import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostgresDatabaseProviderModule } from "@/providers/database/postgres/provider.module";
import { AppController } from "@/src/app.controller";
import { AppService } from "@/src/app.service";
import global_config from "@/config/global_config";
import { BullModule } from "@nestjs/bull";

import { UserModule } from "@/modules/user/user.module";
import { AuthModule } from "@/modules/auth/auth.module";
import { DisasterModule } from "@/modules/disaster/disaster.module";
import { SosModule } from "@/modules/sos/sos.module";
import { ShelterModule } from "@/modules/shelter/shelter.module";
import { SupplyModule } from "@/modules/supply/supply.module";
import { ResponderModule } from "@/modules/responder/responder.module";
import { DonationModule } from "@/modules/donation/donation.module";
import { NgoApplicationModule } from "@/modules/ngo-application/ngo-application.module";
import { AdminModule } from "@/modules/admin/admin.module";

import { User } from "@/modules/user/entities/user.entity";
import { Disaster } from "@/modules/disaster/entities/disaster.entity";
import { SosRequest } from "@/modules/sos/entities/sos.entity";
import { Shelter } from "@/modules/shelter/entities/shelter.entity";
import { SupplyItem } from "@/modules/supply/entities/supply.entity";
import { ResponderTeam } from "@/modules/responder/entities/responder.entity";
import { Donation } from "@/modules/donation/entities/donation.entity";
import { NgoApplication } from "@/modules/ngo-application/entities/ngo-application.entity";
import { SeederService } from "@/database/seeder.service";

const optionalModules = [];
if (process.env.REDIS_URL && process.env.REDIS_URL.trim() !== "") {
  optionalModules.push(
    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),
    PostgresDatabaseProviderModule,
    TypeOrmModule.forFeature([
      User,
      Disaster,
      SosRequest,
      Shelter,
      SupplyItem,
      ResponderTeam,
      Donation,
      NgoApplication,
    ]),
    UserModule,
    AuthModule,
    DisasterModule,
    SosModule,
    ShelterModule,
    SupplyModule,
    ResponderModule,
    DonationModule,
    NgoApplicationModule,
    AdminModule,
    ...optionalModules,
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule {}
