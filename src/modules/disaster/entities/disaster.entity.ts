import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "disasters" })
export class Disaster {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  title!: string;

  @Column({ nullable: true })
  banglaTitle?: string;

  @Column({ default: "flood" })
  type!: string;

  @Column({ default: "moderate" })
  severity!: string;

  @Column({ default: "active" })
  status!: string;

  @Column({ default: "demo" })
  dataSource!: string;

  @Column({ default: false })
  isDemo!: boolean;

  @Column("jsonb", { nullable: true })
  citation?: any;

  @Column("jsonb", { nullable: true })
  location!: {
    name?: string;
    division?: string;
    district?: string;
    lat: number;
    lng: number;
  };

  @Column({ type: "int", default: 0 })
  affectedPopulation!: number;

  @Column({ type: "int", default: 0 })
  casualtiesReported!: number;

  @Column({ type: "int", default: 0 })
  respondersDeployed!: number;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  reportedAt!: Date;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "float", nullable: true })
  recommendedEvacuationRadiusKm?: number;

  @Column("simple-array", { default: "" })
  activeHazards!: string[];

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;
}
