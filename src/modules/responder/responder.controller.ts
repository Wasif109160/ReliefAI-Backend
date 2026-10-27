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
import { ResponderService } from "./responder.service";
import {
  CreateResponderDto,
  UpdateResponderStatusDto,
} from "./dto/responder.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("responders")
@Controller("responders")
export class ResponderController {
  constructor(private readonly responderService: ResponderService) {}

  @Get()
  @ApiOperation({ summary: "Get all deployed and available responder teams" })
  async getResponders() {
    return await this.responderService.getResponders();
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.GOVERNMENT, Role.COMMANDER)
  @Post()
  @ApiOperation({ summary: "Deploy a new responder team" })
  async createResponder(@Body() dto: CreateResponderDto) {
    return await this.responderService.createResponder(dto);
  }

  // Dual support: PATCH /responders/:id and PATCH /responders with body { teamId, status }
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.RESCUE_TEAM, Role.COMMANDER, Role.RESPONDER, Role.ADMIN, Role.GOVERNMENT)
  @Patch(":id")
  @ApiOperation({ summary: "Update team operational status by path param ID" })
  async updateStatusParam(
    @Param("id") id: string,
    @Body() dto: UpdateResponderStatusDto,
  ) {
    return await this.responderService.updateStatus(id, dto.status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.RESCUE_TEAM, Role.COMMANDER, Role.RESPONDER, Role.ADMIN, Role.GOVERNMENT)
  @Patch()
  @ApiOperation({ summary: "Update team operational status with body payload" })
  async updateStatusBody(@Body() dto: UpdateResponderStatusDto) {
    const targetId = dto.teamId;
    if (!targetId) {
      throw new Error("Missing teamId");
    }
    return await this.responderService.updateStatus(targetId, dto.status);
  }
}
