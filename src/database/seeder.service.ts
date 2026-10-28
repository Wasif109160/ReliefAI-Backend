import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as argon2 from "argon2";
import { User } from "@/modules/user/entities/user.entity";
import { Disaster } from "@/modules/disaster/entities/disaster.entity";
import { SosRequest } from "@/modules/sos/entities/sos.entity";
import { Shelter } from "@/modules/shelter/entities/shelter.entity";
import { SupplyItem } from "@/modules/supply/entities/supply.entity";
import { ResponderTeam } from "@/modules/responder/entities/responder.entity";
import { Donation } from "@/modules/donation/entities/donation.entity";
import { NgoApplication } from "@/modules/ngo-application/entities/ngo-application.entity";
import { Role } from "@/common/enums/role.enum";

@Injectable()
export class SeederService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Disaster)
    private readonly disasterRepo: Repository<Disaster>,
    @InjectRepository(SosRequest)
    private readonly sosRepo: Repository<SosRequest>,
    @InjectRepository(Shelter)
    private readonly shelterRepo: Repository<Shelter>,
    @InjectRepository(SupplyItem)
    private readonly supplyRepo: Repository<SupplyItem>,
    @InjectRepository(ResponderTeam)
    private readonly responderRepo: Repository<ResponderTeam>,
    @InjectRepository(Donation)
    private readonly donationRepo: Repository<Donation>,
    @InjectRepository(NgoApplication)
    private readonly ngoRepo: Repository<NgoApplication>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.seedUsers();
      await this.seedDisasters();
      await this.seedShelters();
      await this.seedSupplies();
      await this.seedResponders();
      await this.seedSosRequests();
      await this.seedDonations();
      await this.seedNgoApplications();
    } catch (error) {
      console.error("[Seeder] Error during initial database seeding:", error);
    }
  }

  private async seedUsers() {
    console.log("[Seeder] Verifying and seeding ReliefAI demo accounts...");

    const usersToCreate = [
      {
        name: "Brig. Gen. Mostafizur Rahman",
        displayName: "Brig. Gen. Mostafizur Rahman (Admin)",
        email: "admin@relief.ai",
        passwordRaw: "Admin@123456",
        role: Role.ADMIN,
        organization: "Department of Disaster Management (DDM / AFD)",
        badgeNumber: "BD-AFD-9001",
        phone: "+880 1711-001122",
        assignedZone: "National EOC Dhaka",
        skills: ["National Crisis Command", "Armed Forces Logistics", "ICS-400"],
      },
      {
        name: "Farhana Huq",
        displayName: "Farhana Huq (Red Crescent)",
        email: "ngo@relief.ai",
        passwordRaw: "Ngo@123456",
        role: Role.NGO,
        organization: "Bangladesh Red Crescent Society (BDRCS)",
        phone: "+880 1912-003344",
        assignedZone: "Sylhet & Chittagong Coastal",
        skills: ["Emergency Ambulance", "Speedboat Extraction", "Relief Mesh"],
      },
      {
        name: "Tanvir Ahmed",
        displayName: "Tanvir Ahmed (Field Volunteer)",
        email: "volunteer@relief.ai",
        passwordRaw: "Volunteer@123456",
        role: Role.VOLUNTEER,
        organization: "Cyclone Preparedness Programme (CPP)",
        badgeNumber: "CPP-VOL-0842",
        phone: "+880 1812-334455",
        assignedZone: "Cox's Bazar Coastal Sector",
        skills: ["Community Warning", "Evacuation Marshalling", "First Aid"],
      },
      {
        name: "Rahim Uddin",
        displayName: "Rahim Uddin (Citizen Reporter)",
        email: "citizen@relief.ai",
        passwordRaw: "Citizen@123456",
        role: Role.CITIZEN,
        phone: "+880 1712-998877",
        assignedZone: "Gowainghat, Sylhet",
        skills: ["Community Emergency Response"],
      },
      {
        name: "Maj. Gen. Sajjadul Islam",
        displayName: "Maj. Gen. Sajjadul Islam (Super Admin)",
        email: "superadmin@relief.ai",
        passwordRaw: "SuperAdmin@123456",
        role: Role.SUPER_ADMIN,
        organization: "National Disaster Management Command & Coordination Authority",
        badgeNumber: "BD-SADM-0001",
        phone: "+880 1711-998877",
        assignedZone: "National Strategic Command Dhaka",
        skills: ["Crisis Command", "Satellite Mesh", "Civil Protection"],
      },
      {
        name: "Major Tariqul Islam",
        displayName: "Major Tariqul Islam (FSCD Commander)",
        email: "rescue@relief.ai",
        passwordRaw: "Rescue@123456",
        role: Role.RESCUE_TEAM,
        organization: "Fire Service & Civil Defence (FSCD)",
        badgeNumber: "FSCD-DIV-001",
        assignedTeamId: "team-01",
        phone: "+880 1714-556677",
        assignedZone: "Sylhet Division Sector Alpha",
        skills: ["Swift Water Rescue", "Dive Master", "Trauma Triage"],
      },
      {
        name: "Dr. Tareq Mahmud",
        displayName: "Sec. Dr. Tareq Mahmud",
        email: "gov@relief.ai",
        passwordRaw: "Gov@123456",
        role: Role.GOVERNMENT,
        organization: "Ministry of Disaster Management and Relief (MoDMR)",
        phone: "+880 1713-445566",
        assignedZone: "Ministry HQ Bangladesh Secretariat",
        skills: ["Inter-Agency Governance", "Strategic Resource Allocation"],
      },
    ];

    for (const u of usersToCreate) {
      const cleanEmail = u.email.toLowerCase().trim();
      let user = await this.userRepo.findOne({ where: { email: cleanEmail } });
      const hashedPassword = await argon2.hash(u.passwordRaw);

      if (!user) {
        user = this.userRepo.create({
          name: u.name,
          displayName: u.displayName,
          email: cleanEmail,
          password: hashedPassword,
          role: u.role,
          organization: u.organization,
          badgeNumber: u.badgeNumber,
          assignedTeamId: u.assignedTeamId,
          phone: u.phone,
          assignedZone: u.assignedZone,
          skills: u.skills || [],
          isEmailVerified: true,
          status: "approved",
        });
        await this.userRepo.save(user);
      } else {
        // Update password and role to ensure demo accounts match credentials
        user.password = hashedPassword;
        user.role = u.role;
        user.name = u.name;
        user.displayName = u.displayName;
        await this.userRepo.save(user);
      }
    }
    console.log("[Seeder] All demo users ensured.");
  }

  private async seedDisasters() {
    const count = await this.disasterRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding initial disasters...");
    const disasters = [
      {
        title: "2026 Surma River Basin Flash Flood",
        banglaTitle: "২০২৬ সুরমা নদী অববাহিকা আকস্মিক বন্যা",
        type: "flood",
        severity: "critical",
        status: "active",
        dataSource: "live",
        location: {
          name: "Sylhet & Sunamganj River Basin",
          division: "Sylhet",
          district: "Sylhet",
          lat: 24.8949,
          lng: 91.8687,
        },
        affectedPopulation: 420000,
        casualtiesReported: 4,
        respondersDeployed: 280,
        description:
          "Heavy torrential runoff from Meghalaya hills coupled with record Surma river swelling breached dykes at Gowainghat and Companiganj.",
        recommendedEvacuationRadiusKm: 15.0,
        activeHazards: ["Submerged electrical infrastructure", "Fast river currents", "Safe drinking water shortage"],
      },
      {
        title: "Cyclone Landfall Warning: Kutubdia Embankment",
        banglaTitle: "ঘূর্ণিঝড় পূর্বাভাস: কুতুবদিয়া উপকূলীয় বাঁধ",
        type: "hurricane",
        severity: "high",
        status: "active",
        dataSource: "live",
        location: {
          name: "Kutubdia Channel & Coastal Embankment",
          division: "Chittagong",
          district: "Cox's Bazar",
          lat: 21.816,
          lng: 91.854,
        },
        affectedPopulation: 185000,
        casualtiesReported: 0,
        respondersDeployed: 140,
        description:
          "Severe cyclonic system approaching eastern Bay of Bengal coastline with storm surge forecast of 6-9 feet above astronomical tide.",
        recommendedEvacuationRadiusKm: 25.0,
        activeHazards: ["Tidal inundation", "Uprooted trees", "Marine communication disruption"],
      },
    ];

    for (const d of disasters) {
      await this.disasterRepo.save(this.disasterRepo.create(d));
    }
  }

  private async seedShelters() {
    const count = await this.shelterRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding initial shelters...");
    const shelters = [
      {
        name: "Sylhet Government Multi-Purpose Cyclone & Flood Shelter",
        address: "Gowainghat Upazila Complex, Sylhet",
        lat: 25.076,
        lng: 91.975,
        capacity: 1200,
        currentOccupancy: 850,
        hasMedical: true,
        hasFood: true,
        hasWater: true,
        hasPower: true,
        isPetFriendly: true,
        hasSupplies: true,
        contactPhone: "+880 1711-334455",
        managedByNGO: "Bangladesh Red Crescent Society",
        status: "open",
      },
      {
        name: "Sunamganj Sadar High School Relief Shelter",
        address: "Hospital Road, Sunamganj Sadar",
        lat: 25.066,
        lng: 91.407,
        capacity: 800,
        currentOccupancy: 760,
        hasMedical: true,
        hasFood: true,
        hasWater: true,
        hasPower: false,
        isPetFriendly: false,
        hasSupplies: true,
        contactPhone: "+880 1819-223344",
        managedByNGO: "BRAC Disaster Cluster",
        status: "nearing_capacity",
      },
      {
        name: "Kutubdia Multi-Purpose Cyclone Shelter 4",
        address: "Ali Akbar Deil, Kutubdia Coastal Embankment",
        lat: 21.816,
        lng: 91.854,
        capacity: 1500,
        currentOccupancy: 420,
        hasMedical: true,
        hasFood: true,
        hasWater: true,
        hasPower: true,
        isPetFriendly: false,
        hasSupplies: true,
        contactPhone: "+880 1611-778899",
        managedByNGO: "CPP / MoDMR",
        status: "open",
      },
    ];

    for (const s of shelters) {
      await this.shelterRepo.save(this.shelterRepo.create(s));
    }
  }

  private async seedSupplies() {
    const count = await this.supplyRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding initial relief supplies...");
    const supplies = [
      {
        name: "Clean Water Purifying Tablets (Aquatabs 67mg)",
        category: "water",
        quantity: 85000,
        unit: "tablets",
        warehouseLocation: "Sylhet Central Disaster Relief Hub",
        status: "adequate",
        threshold: 15000,
        allocated: 32000,
      },
      {
        name: "High Energy Fortified Biscuits (Ready-to-Eat WFP Rations)",
        category: "rations",
        quantity: 14200,
        unit: "cartons (48 packs)",
        warehouseLocation: "Dhaka Central Logistics Warehouse (Tejgaon)",
        status: "adequate",
        threshold: 3000,
        allocated: 6400,
      },
      {
        name: "Emergency Cholera & IV Saline Infusion Kits",
        category: "medical",
        quantity: 380,
        unit: "trauma packs",
        warehouseLocation: "Sunamganj District Hospital Depot",
        status: "low",
        threshold: 500,
        allocated: 290,
      },
      {
        name: "Zodiac Inflatable Rescue Boats (with 40HP Outboard Motors)",
        category: "vehicles",
        quantity: 18,
        unit: "skiffs",
        warehouseLocation: "FSCD Riverine Logistics Base Sylhet",
        status: "adequate",
        threshold: 5,
        allocated: 12,
      },
      {
        name: "Heavy-Duty 15kVA Diesel Back-up Generators",
        category: "generators",
        quantity: 9,
        unit: "units",
        warehouseLocation: "Gowainghat Upazila Disaster Reserve",
        status: "critical",
        threshold: 10,
        allocated: 8,
      },
    ];

    for (const item of supplies) {
      await this.supplyRepo.save(this.supplyRepo.create(item));
    }
  }

  private async seedResponders() {
    const count = await this.responderRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding responder teams...");
    const responders = [
      {
        id: "team-01",
        name: "FSCD Sylhet Swift-Water Dive Team 1",
        leadName: "Major Tariqul Islam",
        type: "swift_water",
        membersCount: 8,
        status: "available",
        currentLocation: {
          name: "Gowainghat Flood Landing Stage",
          lat: 25.076,
          lng: 91.975,
        },
        radioFreq: "156.800 MHz (VHF Ch 16)",
        equipment: ["3x Zodiac Boats", "Sonar Depth Scanner", "Trauma First Aid Kit", "Satellite Phone"],
      },
      {
        id: "team-02",
        name: "Bangladesh Army 17th Infantry Division Medical Unit",
        leadName: "Lt. Col. Faruq Hossain",
        type: "medical_unit",
        membersCount: 16,
        status: "available",
        currentLocation: {
          name: "Jalalabad Cantonment Forward Field Station",
          lat: 24.912,
          lng: 91.845,
        },
        radioFreq: "148.550 MHz Tactical Encrypted",
        equipment: ["Ambulance Hovercraft", "Mobile Surgical Tent", "Blood Cold-Chain", "Portable Oxygen"],
      },
      {
        id: "team-03",
        name: "Red Crescent Emergency Logistics Team Alpha",
        leadName: "Farhana Huq",
        type: "logistics",
        membersCount: 12,
        status: "available",
        currentLocation: {
          name: "BDRCS Central Warehouse Sylhet",
          lat: 24.891,
          lng: 91.872,
        },
        radioFreq: "162.400 MHz Local Net",
        equipment: ["4x 4x4 Heavy Trucks", "Drone Recon Fleet", "Starlink Terminal", "Water Filtration Unit"],
      },
    ];

    for (const r of responders) {
      await this.responderRepo.save(this.responderRepo.create(r));
    }
  }

  private async seedSosRequests() {
    const count = await this.sosRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding initial SOS requests...");
    const requests = [
      {
        reporterName: "Rafiqul Islam",
        phone: "+880 1712-345678",
        disasterId: "dis-001",
        location: {
          address: "Road 4, Gowainghat Upazila, Sylhet (Near Surma Riverbank)",
          lat: 25.076,
          lng: 91.975,
        },
        urgencyScore: 97,
        priority: "CRITICAL",
        status: "pending",
        details:
          "Surma flash floodwaters reached rooftop! 6 family members stranded including 85-year-old grandmother and infant. Current flowing fast. Need swift extraction boat immediately.",
        trappedCount: 6,
        injuriesCount: 1,
        specialNeeds: ["elderly", "infant", "hypothermia"],
        needsBoat: true,
        needsMedical: true,
        needsFoodWater: false,
        aiTriageSummary:
          "Immediate swift-water shallow draft boat rescue needed. Deploy FSCD Speedboat Unit with trauma stabilization kit.",
      },
      {
        reporterName: "Ayesha Siddiqua",
        phone: "+880 1819-876543",
        disasterId: "dis-001",
        location: {
          address: "Ward 3, Sunamganj Sadar Upazila (Beside Old District Hospital)",
          lat: 25.066,
          lng: 91.407,
        },
        urgencyScore: 93,
        priority: "CRITICAL",
        status: "dispatched",
        details:
          "Hospital basement flooded, power back-up failed. 8 neonatal patients on portable oxygen and 4 pregnant mothers stranded on first floor.",
        trappedCount: 12,
        injuriesCount: 2,
        specialNeeds: ["neonatal", "maternal_care", "oxygen_dependent"],
        needsBoat: true,
        needsMedical: true,
        needsFoodWater: true,
        assignedTeamId: "team-01",
        assignedTeamName: "FSCD Sylhet Swift-Water Dive Team 1",
        dispatchEtaMinutes: 7,
        aiTriageSummary:
          "High-risk pediatric/maternal evacuation. Dispatched 2x Zodiac inflatable rescue skiffs with battery generators and pediatric EMTs.",
      },
    ];

    for (const sos of requests) {
      await this.sosRepo.save(this.sosRepo.create(sos));
    }
  }

  private async seedDonations() {
    const count = await this.donationRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding initial donations...");
    const donations = [
      {
        donorName: "Sylhet Diaspora Welfare Association (UK)",
        donorEmail: "welfare@sylhetdiaspora.co.uk",
        amount: 500000,
        currency: "BDT",
        allocatedCause: "Rapid Deployment Rescue Speedboats & High-Water Extraction",
        impactMetric: "333 Clean Water Filtration Kits Deployed",
        txHash: "0x892a4e8d3c11f77b94a2e5d1643c7b91a2e3f4c5",
        channel: "Direct Humanitarian Wire",
        isVerified: true,
      },
      {
        donorName: "Anwar Chowdhury",
        donorEmail: "anwar.c@gmail.com",
        amount: 25000,
        currency: "BDT",
        allocatedCause: "Gowainghat Infant Nutrition & Emergency Clean Water",
        impactMetric: "100 Emergency Dry Rations & Oral Saline Delivered",
        txHash: "0x12ab56cd78ef90ab34cd56ef78ab90cd12ef34ab",
        channel: "bKash Humanitarian Gateway",
        isVerified: true,
      },
    ];

    for (const d of donations) {
      await this.donationRepo.save(this.donationRepo.create(d));
    }
  }

  private async seedNgoApplications() {
    const count = await this.ngoRepo.count();
    if (count > 0) return;

    console.log("[Seeder] Seeding initial NGO application...");
    const apps = [
      {
        organizationName: "BRAC Disaster Management Cluster",
        registrationNumber: "NGOAB-DH-2024-0042",
        focalPersonName: "Mahmudul Hasan",
        focalPersonEmail: "brac.relief@humanitarian.org",
        focalPersonPhone: "+880 1711-223344",
        website: "https://brac.net",
        hqAddress: "BRAC Centre, 75 Mohakhali, Dhaka-1212",
        operationalDistricts: ["Sylhet", "Sunamganj", "Kurigram", "Netrokona"],
        reliefCapabilities: ["Water Purification", "Emergency Food Rations", "Shelter Logistics"],
        documentName: "BRAC_NGOAB_Renewal_Certificate_2025.pdf",
        status: "pending",
      },
    ];

    for (const a of apps) {
      await this.ngoRepo.save(this.ngoRepo.create(a));
    }
  }
}
