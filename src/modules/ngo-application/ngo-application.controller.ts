import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { NgoApplicationService } from "./ngo-application.service";
import {
  CreateNgoApplicationDto,
  ReviewNgoApplicationDto,
} from "./dto/ngo-application.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("ngo-applications")
@Controller("ngo-applications")
export class NgoApplicationController {
  constructor(private readonly ngoService: NgoApplicationService) {}

  @Post()
  @ApiOperation({ summary: "Submit an NGO agency relief accreditation application" })
  async submitApplication(@Body() dto: CreateNgoApplicationDto) {
    return await this.ngoService.submitApplication(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: "Get all NGO applications for admin review" })
  async getApplications(@Query("status") status: string) {
    return await this.ngoService.getApplications(status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(":id/review")
  @ApiOperation({ summary: "Approve or reject an NGO application" })
  async reviewApplication(
    @Param("id") id: string,
    @Body() dto: ReviewNgoApplicationDto,
    @Req() req: any,
  ) {
    const reviewerEmail = req.user?.email || "admin@relief.ai";
    return await this.ngoService.reviewApplication(id, reviewerEmail, dto);
  }
}
