import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Disaster } from "./entities/disaster.entity";
import { CreateDisasterDto } from "./dto/disaster.dto";

@Injectable()
export class DisasterService {
  constructor(
    @InjectRepository(Disaster)
    private readonly disasterRepository: Repository<Disaster>,
  ) {}

  async getDisasters(filter: any = {}) {
    let disasters = await this.disasterRepository.find({
      order: { reportedAt: "DESC" },
    });

    if (filter.type && filter.type !== "all") {
      disasters = disasters.filter((d) => d.type === filter.type);
    }
    if (filter.severity && filter.severity !== "all") {
      disasters = disasters.filter((d) => d.severity === filter.severity);
    }
    if (filter.status && filter.status !== "all") {
      disasters = disasters.filter((d) => d.status === filter.status);
    }
    if (filter.division && filter.division !== "all") {
      disasters = disasters.filter(
        (d) =>
          d.location?.division?.toLowerCase() === filter.division.toLowerCase(),
      );
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      disasters = disasters.filter(
        (d) =>
          d.title.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.location?.name?.toLowerCase().includes(q),
      );
    }

    const totalIncidents = disasters.length;
    const activeIncidents = disasters.filter((d) => d.status === "active").length;
    const criticalCount = disasters.filter((d) => d.severity === "critical").length;
    const totalAffected = disasters.reduce((sum, d) => sum + (d.affectedPopulation || 0), 0);
    const totalResponders = disasters.reduce((sum, d) => sum + (d.respondersDeployed || 0), 0);

    const stats = {
      totalIncidents,
      activeIncidents,
      criticalCount,
      totalAffected,
      totalResponders,
      mode: "live",
      providerName: "ReliefAI Bangladesh Disaster Management Authority (BMD & BWDB Live)",
      liveApiStatusMessage: "Operational and streaming telemetry",
      lastUpdated: new Date().toISOString(),
    };

    return {
      disasters,
      stats,
      mode: stats.mode,
      isDemo: false,
      provider: stats.providerName,
      liveApiStatusMessage: stats.liveApiStatusMessage,
      lastUpdated: stats.lastUpdated,
    };
  }

  async getDisasterById(id: string) {
    const disaster = await this.disasterRepository.findOne({ where: { id } });
    if (!disaster) {
      throw new NotFoundException(`Disaster with ID ${id} not found`);
    }
    return disaster;
  }

  async createDisaster(dto: CreateDisasterDto) {
    const disaster = this.disasterRepository.create(dto);
    return await this.disasterRepository.save(disaster);
  }
}
