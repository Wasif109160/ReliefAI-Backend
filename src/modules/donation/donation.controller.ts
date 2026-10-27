import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DonationService } from "./donation.service";
import { CreateDonationDto } from "./dto/donation.dto";

@ApiTags("donations")
@Controller("donations")
export class DonationController {
  constructor(private readonly donationService: DonationService) {}

  @Get()
  @ApiOperation({ summary: "Get public disaster relief donation audit ledger" })
  async getDonations() {
    return await this.donationService.getDonations();
  }

  @Post()
  @ApiOperation({ summary: "Process a verified humanitarian aid donation" })
  async createDonation(@Body() dto: CreateDonationDto) {
    return await this.donationService.createDonation(dto);
  }
}
