import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SosRequest } from "./entities/sos.entity";
import { ResponderTeam } from "@/modules/responder/entities/responder.entity";
import { CreateSosDto, DispatchSosDto } from "./dto/sos.dto";

@Injectable()
export class SosService {
  constructor(
    @InjectRepository(SosRequest)
    private readonly sosRepository: Repository<SosRequest>,
    @InjectRepository(ResponderTeam)
    private readonly responderRepository: Repository<ResponderTeam>,
  ) {}

  async getSosRequests(query: { priority?: string; status?: string } = {}) {
    let requests = await this.sosRepository.find({
      order: { urgencyScore: "DESC", created_at: "DESC" },
    });

    if (query.priority) {
      requests = requests.filter(
        (r) => r.priority?.toUpperCase() === query.priority?.toUpperCase(),
      );
    }
    if (query.status) {
      requests = requests.filter(
        (r) => r.status?.toLowerCase() === query.status?.toLowerCase(),
      );
    }

    return requests;
  }

  async getSosById(id: string) {
    const sos = await this.sosRepository.findOne({ where: { id } });
    if (!sos) {
      throw new NotFoundException(`SOS request with ID ${id} not found`);
    }
    return sos;
  }

  async createSos(dto: CreateSosDto) {
    let score = dto.urgencyScore ?? 60;
    let priority = dto.priority ?? "HIGH";

    if (dto.urgencyScore === undefined) {
      if (
        (dto.trappedCount && dto.trappedCount > 5) ||
        (dto.injuriesCount && dto.injuriesCount > 2) ||
        dto.needsBoat
      ) {
        score = 92;
        priority = "CRITICAL";
      } else if (dto.trappedCount && dto.trappedCount > 0) {
        score = 78;
        priority = "HIGH";
      }
    }

    const sos = this.sosRepository.create({
      reporterName: dto.reporterName,
      phone: dto.phone,
      contactPhone: dto.contactPhone,
      disasterId: dto.disasterId || "dis-001",
      location: dto.location,
      urgencyScore: score,
      priority,
      status: "pending",
      details: dto.details,
      trappedCount: dto.trappedCount || 0,
      injuriesCount: dto.injuriesCount || 0,
      specialNeeds: dto.specialNeeds || [],
      needsBoat: Boolean(dto.needsBoat),
      needsMedical: Boolean(dto.needsMedical),
      needsFoodWater: Boolean(dto.needsFoodWater),
      aiTriageSummary: `AI Urgency Score ${score}/100. Dispatched automated alert to regional tactical ops.`,
    });

    const saved = await this.sosRepository.save(sos);
    return {
      sos: saved,
      aiAnalysis: {
        urgencyScore: score,
        priority,
        suggestedTeamType: dto.needsBoat ? "swift_water" : "search_rescue",
        triageSummary: saved.aiTriageSummary,
      },
    };
  }

  async dispatchSos(id: string, dto: DispatchSosDto) {
    return this.sosRepository.manager.transaction(async (manager) => {
      const sosRepo = manager.getRepository(SosRequest);
      const teamRepo = manager.getRepository(ResponderTeam);
      const sos = await sosRepo.findOne({
        where: { id },
        lock: { mode: "pessimistic_write" },
      });
      if (!sos) {
        throw new NotFoundException(`SOS request with ID ${id} not found`);
      }

      if (sos.status !== "pending")
        throw new ConflictException("SOS is no longer pending");
      const team = await teamRepo.findOne({
        where: { id: dto.teamId },
        lock: { mode: "pessimistic_write" },
      });
      if (!team) throw new NotFoundException("Responder team not found");
      if (team.status !== "available" || team.assignedSOSId)
        throw new ConflictException("Team is unavailable");

      sos.status = "dispatched";
      sos.assignedTeamId = dto.teamId;
      sos.assignedTeamName = team.name;
      sos.dispatchEtaMinutes = dto.etaMinutes ?? 12;

      if (team) {
        team.status = "dispatched";
        team.assignedSOSId = sos.id;
        await teamRepo.save(team);
      }

      const updated = await sosRepo.save(sos);
      return {
        success: true,
        sos: updated,
        dispatchedTeam: team,
      };
    });
  }
}
