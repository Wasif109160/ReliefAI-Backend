import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "donations" })
export class Donation {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  donorName!: string;

  @Column({ nullable: true })
  donorEmail?: string;

  @Column("float")
  amount!: number;

  @Column({ default: "BDT" })
  currency!: string;

  @Column()
  allocatedCause!: string;

  @Column()
  impactMetric!: string;

  @Column()
  txHash!: string;

  @Column({ nullable: true })
  channel?: string;

  @Column({ default: true })
  isVerified!: boolean;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;
}
