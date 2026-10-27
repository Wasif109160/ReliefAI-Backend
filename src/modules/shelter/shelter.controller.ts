import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ShelterService } from "./shelter.service";
import { CreateShelterDto, UpdateOccupancyDto } from "./dto/shelter.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("shelters")
@Controller("shelters")
export class ShelterController {
  constructor(private readonly shelterService: ShelterService) {}

  @Get()
  @ApiOperation({ summary: "Get all emergency shelters" })
  async getShelters() {
    return await this.shelterService.getShelters();
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.NGO, Role.GOVERNMENT, Role.ADMIN)
  @Post()
  @ApiOperation({ summary: "Register a new shelter" })
  async createShelter(@Body() dto: CreateShelterDto) {
    return await this.shelterService.createShelter(dto);
  }

  // Dual support: PATCH /shelters/:id and PATCH /shelters
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.NGO, Role.GOVERNMENT, Role.ADMIN, Role.RESCUE_TEAM, Role.COMMANDER)
  @Patch(":id")
  @ApiOperation({ summary: "Update shelter live occupancy by path param ID" })
  async updateOccupancy(
    @Param("id") id: string,
    @Body() dto: UpdateOccupancyDto,
  ) {
    return await this.shelterService.updateOccupancy(id, dto.currentOccupancy);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.NGO, Role.GOVERNMENT, Role.ADMIN, Role.RESCUE_TEAM, Role.COMMANDER)
  @Patch()
  @ApiOperation({ summary: "Update shelter live occupancy with body payload" })
  async updateOccupancyBody(@Body() dto: UpdateOccupancyDto) {
    if (!dto.id) {
      throw new Error("Missing shelter id");
    }
    return await this.shelterService.updateOccupancy(dto.id, dto.currentOccupancy);
  }
}
