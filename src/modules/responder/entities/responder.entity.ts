import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "responder_teams" })
export class ResponderTeam {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  name!: string;

  @Column()
  leadName!: string;

  @Column({ default: "search_rescue" })
  type!: string;

  @Column({ type: "int", default: 4 })
  membersCount!: number;

  @Column({ default: "available" })
  status!: string;

  @Column({ nullable: true })
  currentIncidentId?: string;

  @Column({ nullable: true })
  assignedSOSId?: string;

  @Column("jsonb")
  currentLocation!: {
    name?: string;
    lat: number;
    lng: number;
  };

  @Column({ default: "156.800 MHz" })
  radioFreq!: string;

  @Column("simple-array", { default: "" })
  equipment!: string[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastCheckIn!: Date;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;
}
