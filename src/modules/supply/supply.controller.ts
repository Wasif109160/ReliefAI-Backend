import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { SupplyService } from "./supply.service";
import { CreateSupplyDto, UpdateSupplyActionDto } from "./dto/supply.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("supplies")
@Controller("supplies")
export class SupplyController {
  constructor(private readonly supplyService: SupplyService) {}

  @Get()
  @ApiOperation({ summary: "Get all relief inventory supplies" })
  async getSupplies() {
    return await this.supplyService.getSupplies();
  }

  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.NGO, Role.ADMIN, Role.GOVERNMENT, Role.COMMANDER)
  @Post()
  @ApiOperation({ summary: "Dispatch or restock relief items, or register new item" })
  async handleAction(@Body() body: any) {
    if (body.action && body.id && body.quantity) {
      return await this.supplyService.processAction(body as UpdateSupplyActionDto);
    }
    return await this.supplyService.createSupply(body as CreateSupplyDto);
  }
}
