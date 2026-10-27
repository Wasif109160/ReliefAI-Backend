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
import { SosService } from "./sos.service";
import { CreateSosDto, DispatchSosDto } from "./dto/sos.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("sos")
@Controller("sos")
export class SosController {
  constructor(private readonly sosService: SosService) {}

  @Get()
  @ApiOperation({ summary: "Get all SOS requests" })
  async getSosRequests(@Query() query: any) {
    return await this.sosService.getSosRequests(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get SOS request details by ID" })
  async getSosById(@Param("id") id: string) {
    return await this.sosService.getSosById(id);
  }

  @Post()
  @ApiOperation({ summary: "Submit a new SOS distress signal" })
  async createSos(@Body() dto: CreateSosDto) {
    return await this.sosService.createSos(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COMMANDER, Role.GOVERNMENT, Role.RESCUE_TEAM)
  @Post(":id/dispatch")
  @ApiOperation({ summary: "Dispatch a responder team to an SOS emergency" })
  async dispatchSos(@Param("id") id: string, @Body() dto: DispatchSosDto) {
    return await this.sosService.dispatchSos(id, dto);
  }
}
