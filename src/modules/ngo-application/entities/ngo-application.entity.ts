import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "ngo_applications" })
export class NgoApplication {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  organizationName!: string;

  @Column({ unique: true })
  registrationNumber!: string;

  @Column()
  focalPersonName!: string;

  @Column()
  focalPersonEmail!: string;

  @Column()
  focalPersonPhone!: string;

  @Column({ nullable: true })
  website?: string;

  @Column()
  hqAddress!: string;

  @Column("simple-array", { default: "" })
  operationalDistricts!: string[];

  @Column("simple-array", { default: "" })
  reliefCapabilities!: string[];

  @Column({ nullable: true })
  documentName?: string;

  @Column({ type: "text", nullable: true })
  documentData?: string;

  @Column({ default: "pending" })
  status!: string;

  @Column({ type: "text", nullable: true })
  adminNotes?: string;

  @Column({ nullable: true })
  reviewedBy?: string;

  @Column({ type: "timestamp", nullable: true })
  reviewedAt?: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;
}
