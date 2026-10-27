import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Shelter } from "./entities/shelter.entity";
import { CreateShelterDto } from "./dto/shelter.dto";

@Injectable()
export class ShelterService {
  constructor(
    @InjectRepository(Shelter)
    private readonly shelterRepository: Repository<Shelter>,
  ) {}

  async getShelters() {
    return await this.shelterRepository.find({
      order: { capacity: "DESC" },
    });
  }

  async createShelter(dto: CreateShelterDto) {
    const shelter = this.shelterRepository.create(dto);
    return await this.shelterRepository.save(shelter);
  }

  async updateOccupancy(id: string, occupancy: number) {
    const shelter = await this.shelterRepository.findOne({ where: { id } });
    if (!shelter) {
      throw new NotFoundException(`Shelter with ID ${id} not found`);
    }

    shelter.currentOccupancy = occupancy;
    if (occupancy >= shelter.capacity) {
      shelter.status = "full";
    } else if (occupancy >= shelter.capacity * 0.85) {
      shelter.status = "nearing_capacity";
    } else {
      shelter.status = "open";
    }

    return await this.shelterRepository.save(shelter);
  }
}
