import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResponderTeam } from "./entities/responder.entity";
import { CreateResponderDto } from "./dto/responder.dto";

@Injectable()
export class ResponderService {
  constructor(
    @InjectRepository(ResponderTeam)
    private readonly responderRepository: Repository<ResponderTeam>,
  ) {}

  async getResponders() {
    return await this.responderRepository.find({
      order: { name: "ASC" },
    });
  }

  async getResponderById(id: string) {
    const team = await this.responderRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Responder team with ID ${id} not found`);
    }
    return team;
  }

  async createResponder(dto: CreateResponderDto) {
    const team = this.responderRepository.create(dto);
    return await this.responderRepository.save(team);
  }

  async updateStatus(id: string, status: string) {
    const team = await this.responderRepository.findOne({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Responder team with ID ${id} not found`);
    }

    team.status = status;
    team.lastCheckIn = new Date();
    return await this.responderRepository.save(team);
  }
}
