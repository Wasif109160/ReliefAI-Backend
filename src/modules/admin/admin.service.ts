import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@/modules/user/entities/user.entity";
import { ResponderTeam } from "@/modules/responder/entities/responder.entity";
import {
  ProvisionUserDto,
  UpdateUserRoleStatusDto,
} from "./dto/admin.dto";
import * as argon2 from "argon2";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ResponderTeam)
    private readonly responderRepository: Repository<ResponderTeam>,
  ) {}

  async getAllUsers() {
    const users = await this.userRepository.find({
      order: { created_at: "DESC" },
    });
    return { users };
  }

  async updateUser(userId: string, dto: UpdateUserRoleStatusDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (dto.role) user.role = dto.role;
    if (dto.isEmailVerified !== undefined) user.isEmailVerified = dto.isEmailVerified;
    if (dto.assignedZone) user.assignedZone = dto.assignedZone;
    if (dto.status) user.status = dto.status;

    const saved = await this.userRepository.save(user);
    return { success: true, user: saved };
  }

  async provisionUser(dto: ProvisionUserDto) {
    const cleanEmail = dto.email.toLowerCase().trim();
    const existing = await this.userRepository.findOne({
      where: { email: cleanEmail },
    });
    if (existing) {
      throw new ConflictException(`User with email '${cleanEmail}' already exists.`);
    }

    if (dto.assignedTeamId) {
      const team = await this.responderRepository.findOne({
        where: { id: dto.assignedTeamId },
      });
      if (!team) {
        throw new BadRequestException(
          `Invalid team assignment: Responder team '${dto.assignedTeamId}' does not exist.`,
        );
      }
    }

    const tempPassword = dto.temporaryPassword || `Relief@${Math.floor(100000 + Math.random() * 900000)}`;
    const hashedPassword = await argon2.hash(tempPassword);

    const user = this.userRepository.create({
      name: dto.name,
      displayName: dto.name,
      email: cleanEmail,
      password: hashedPassword,
      role: dto.role,
      organization: dto.organization,
      badgeNumber: dto.badgeNumber,
      assignedTeamId: dto.assignedTeamId,
      assignedZone: dto.assignedZone,
      phone: dto.phone,
      skills: dto.skills || [],
      isEmailVerified: true,
      status: "approved",
    });

    const saved = await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = saved;

    return {
      success: true,
      user: userWithoutPassword,
      temporaryPassword: tempPassword,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    await this.userRepository.delete({ id: userId });
    return { success: true, message: "User deleted successfully" };
  }
}
