import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Donation } from "./entities/donation.entity";
import { CreateDonationDto } from "./dto/donation.dto";
import * as crypto from "crypto";

@Injectable()
export class DonationService {
  constructor(
    @InjectRepository(Donation)
    private readonly donationRepository: Repository<Donation>,
  ) {}

  async getDonations() {
    const donations = await this.donationRepository.find({
      order: { created_at: "DESC" },
    });
    const totalRaised = donations.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    return {
      donations,
      totalRaised,
    };
  }

  async createDonation(dto: CreateDonationDto) {
    const amount = Number(dto.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new BadRequestException("Donation amount must be greater than zero");
    }

    let impactMetric = `${Math.floor(amount / 250)} Emergency Dry Rations & Oral Saline Delivered`;
    if (amount >= 10000) {
      impactMetric = `${Math.floor(amount / 1500)} Clean Water Filtration Kits Deployed`;
    }

    const txHash = `0x${crypto.randomBytes(16).toString("hex")}`;

    const donation = this.donationRepository.create({
      donorName: dto.donorName || "Anonymous Humanitarian",
      donorEmail: dto.donorEmail,
      amount,
      currency: dto.currency || "BDT",
      allocatedCause: dto.allocatedCause || "Flash Flood Rapid Emergency Response",
      impactMetric,
      txHash,
      channel: dto.channel || "Direct Gateway",
      isVerified: true,
    });

    return await this.donationRepository.save(donation);
  }
}
