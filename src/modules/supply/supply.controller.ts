import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
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
  @ApiOperation({
    summary: "Dispatch or restock relief items, or register new item",
  })
  async handleAction(@Body() body: any) {
    const isAction = Object.prototype.hasOwnProperty.call(body, "action");
    const dto = isAction
      ? plainToInstance(UpdateSupplyActionDto, body)
      : plainToInstance(CreateSupplyDto, body);
    if (
      (await validate(dto, { whitelist: true, forbidNonWhitelisted: true }))
        .length
    ) {
      throw new BadRequestException("Invalid supply request");
    }
    return isAction
      ? this.supplyService.processAction(dto as UpdateSupplyActionDto)
      : this.supplyService.createSupply(dto as CreateSupplyDto);
  }
}
