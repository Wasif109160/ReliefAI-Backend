import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplyItem } from "./entities/supply.entity";
import { CreateSupplyDto, UpdateSupplyActionDto } from "./dto/supply.dto";

@Injectable()
export class SupplyService {
  constructor(
    @InjectRepository(SupplyItem)
    private readonly supplyRepository: Repository<SupplyItem>,
  ) {}

  async getSupplies() {
    return await this.supplyRepository.find({
      order: { quantity: "DESC" },
    });
  }

  async createSupply(dto: CreateSupplyDto) {
    const supply = this.supplyRepository.create(dto);
    return await this.supplyRepository.save(supply);
  }

  async processAction(dto: UpdateSupplyActionDto) {
    const supply = await this.supplyRepository.findOne({ where: { id: dto.id } });
    if (!supply) {
      throw new NotFoundException(`Supply item with ID ${dto.id} not found`);
    }

    const qty = Number(dto.quantity);
    if (isNaN(qty) || qty <= 0) {
      throw new BadRequestException("Quantity must be a positive number");
    }

    if (dto.action === "dispatch") {
      if (supply.quantity < qty) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${supply.quantity}, requested: ${qty}`,
        );
      }
      supply.quantity -= qty;
      supply.allocated = (supply.allocated || 0) + qty;
    } else if (dto.action === "restock") {
      supply.quantity += qty;
    }

    // Refresh status indicator
    if (supply.quantity <= 0) {
      supply.status = "critical";
    } else if (supply.quantity < supply.threshold) {
      supply.status = "low";
    } else {
      supply.status = "adequate";
    }

    return await this.supplyRepository.save(supply);
  }
}
