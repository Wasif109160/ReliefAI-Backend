import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { DisasterService } from "./disaster.service";
import { CreateDisasterDto } from "./dto/disaster.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("disasters")
@Controller("disasters")
export class DisasterController {
  constructor(private readonly disasterService: DisasterService) {}

  @Get()
  @ApiOperation({ summary: "Get all disaster incidents with optional filters" })
  async getDisasters(@Query() query: any) {
    return await this.disasterService.getDisasters(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get disaster incident details by ID" })
  async getDisasterById(@Param("id") id: string) {
    return await this.disasterService.getDisasterById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GOVERNMENT, Role.COMMANDER)
  @Post()
  @ApiOperation({ summary: "Report/Create a new disaster incident" })
  async createDisaster(@Body() dto: CreateDisasterDto) {
    return await this.disasterService.createDisaster(dto);
  }
}
