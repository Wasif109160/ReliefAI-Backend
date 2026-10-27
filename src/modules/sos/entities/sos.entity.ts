import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "sos_requests" })
export class SosRequest {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  reporterName!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  disasterId?: string;

  @Column("jsonb")
  location!: {
    address?: string;
    lat: number;
    lng: number;
  };

  @Column({ type: "float", default: 50 })
  urgencyScore!: number;

  @Column({ default: "MEDIUM" })
  priority!: string;

  @Column({ default: "pending" })
  status!: string;

  @Column({ type: "text" })
  details!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: "int", default: 0 })
  trappedCount!: number;

  @Column({ type: "int", default: 0 })
  injuriesCount!: number;

  @Column("simple-array", { default: "" })
  specialNeeds!: string[];

  @Column({ default: false })
  needsBoat!: boolean;

  @Column({ default: false })
  needsMedical!: boolean;

  @Column({ default: false })
  needsFoodWater!: boolean;

  @Column({ nullable: true })
  assignedTeamId?: string;

  @Column({ nullable: true })
  assignedTeamName?: string;

  @Column({ type: "text", nullable: true })
  aiTriageSummary?: string;

  @Column({ type: "int", nullable: true })
  dispatchEtaMinutes?: number;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;
}
