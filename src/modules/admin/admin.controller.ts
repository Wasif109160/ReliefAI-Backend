import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { ProvisionUserDto, UpdateUserRoleStatusDto } from "./dto/admin.dto";
import { JwtGuard } from "@/common/guard/jwt.guard";
import { RolesGuard } from "@/common/guard/roles.guard";
import { Roles } from "@/common/decorators/roles.decorator";
import { Role } from "@/common/enums/role.enum";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("users")
  @ApiOperation({ summary: "Get all registered users across the platform" })
  async getAllUsers() {
    return await this.adminService.getAllUsers();
  }

  @Patch("users/:id")
  @ApiOperation({ summary: "Update user role or status by path ID" })
  async updateUserParam(
    @Param("id") id: string,
    @Body() dto: UpdateUserRoleStatusDto,
  ) {
    return await this.adminService.updateUser(id, dto);
  }

  @Patch("users")
  @ApiOperation({ summary: "Update user role or status by body payload" })
  async updateUserBody(@Body() dto: UpdateUserRoleStatusDto) {
    if (!dto.userId) {
      throw new Error("Missing userId");
    }
    return await this.adminService.updateUser(dto.userId, dto);
  }

  @Post("users/provision")
  @ApiOperation({ summary: "Provision official responders, commanders, and agency officers" })
  async provisionUser(@Body() dto: ProvisionUserDto) {
    return await this.adminService.provisionUser(dto);
  }

  @Delete("users/:id")
  @ApiOperation({ summary: "Delete a user" })
  async deleteUser(@Param("id") id: string) {
    return await this.adminService.deleteUser(id);
  }
}
