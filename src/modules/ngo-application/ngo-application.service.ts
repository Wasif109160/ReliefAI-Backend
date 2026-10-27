import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NgoApplication } from "./entities/ngo-application.entity";
import { User } from "@/modules/user/entities/user.entity";
import {
  CreateNgoApplicationDto,
  ReviewNgoApplicationDto,
} from "./dto/ngo-application.dto";
import { Role } from "@/common/enums/role.enum";
import * as argon2 from "argon2";

@Injectable()
export class NgoApplicationService {
  constructor(
    @InjectRepository(NgoApplication)
    private readonly ngoRepo: Repository<NgoApplication>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async submitApplication(dto: CreateNgoApplicationDto) {
    const existing = await this.ngoRepo.findOne({
      where: { registrationNumber: dto.registrationNumber },
    });
    if (existing) {
      throw new ConflictException(
        `Application already exists for registration number '${dto.registrationNumber}'`,
      );
    }

    const application = this.ngoRepo.create(dto);
    const saved = await this.ngoRepo.save(application);
    return {
      success: true,
      message: "Application submitted successfully. Awaiting administrative review.",
      application: saved,
    };
  }

  async getApplications(status?: string) {
    let applications = await this.ngoRepo.find({
      order: { created_at: "DESC" },
    });
    if (status && status !== "all") {
      applications = applications.filter((app) => app.status === status);
    }
    return {
      success: true,
      applications,
    };
  }

  async reviewApplication(
    id: string,
    reviewerEmail: string,
    dto: ReviewNgoApplicationDto,
  ) {
    const application = await this.ngoRepo.findOne({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    application.status = dto.action === "approve" ? "approved" : "rejected";
    application.adminNotes = dto.adminNotes;
    application.reviewedBy = reviewerEmail;
    application.reviewedAt = new Date();

    let provisionedUser: Partial<User> | null = null;
    let tempPassword = "";

    if (dto.action === "approve") {
      tempPassword = `Ngo@${Math.floor(100000 + Math.random() * 900000)}`;
      const cleanEmail = application.focalPersonEmail.toLowerCase().trim();

      let user = await this.userRepo.findOne({ where: { email: cleanEmail } });
      if (!user) {
        const hashedPassword = await argon2.hash(tempPassword);
        user = this.userRepo.create({
          name: application.focalPersonName,
          displayName: `${application.focalPersonName} (${application.organizationName})`,
          email: cleanEmail,
          password: hashedPassword,
          role: Role.NGO,
          organization: application.organizationName,
          phone: application.focalPersonPhone,
          assignedZone: application.operationalDistricts.join(", "),
          skills: application.reliefCapabilities,
          isEmailVerified: true,
          status: "approved",
        });
        await this.userRepo.save(user);
      } else {
        user.role = Role.NGO;
        user.organization = application.organizationName;
        await this.userRepo.save(user);
      }

      const { password, ...safeUser } = user;
      provisionedUser = safeUser;
    }

    const savedApp = await this.ngoRepo.save(application);

    return {
      success: true,
      application: savedApp,
      provisionedUser,
      tempPassword: tempPassword || undefined,
    };
  }
}
