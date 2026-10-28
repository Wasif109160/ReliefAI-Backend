import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto, UpdateUserDto } from "./dto/user.dto";
import * as argon2 from "argon2";
import { AuthSession } from "@/modules/auth/entities/auth-session.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUsers() {
    try {
      const users = await this.userRepository.find({
        order: { created_at: "DESC" },
      });
      return users;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async createUser(dto: CreateUserDto) {
    try {
      const hashedPassword = dto.password
        ? await argon2.hash(dto.password)
        : undefined;
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword || "",
      });
      const savedUser = await this.userRepository.save(user);
      const { password, ...userWithoutPassword } = savedUser;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    try {
      if (!id) {
        throw new NotFoundException("User not found");
      }
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      const updates: any = { ...dto };
      if (dto.password) {
        updates.password = await argon2.hash(dto.password);
      }

      await this.userRepository.manager.transaction(async (manager) => {
        await manager.update(User, id, updates);
        if (updates.password)
          await manager.update(
            AuthSession,
            { userId: id },
            { revokedAt: new Date() },
          );
      });
      return await this.userRepository.findOne({ where: { id } });
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await this.userRepository.delete({ id });
      return { message: "User deleted successfully", id };
    } catch (error) {
      throw error;
    }
  }
}
