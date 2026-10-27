import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Role } from "@/common/enums/role.enum";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  displayName?: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.CITIZEN,
  })
  role!: Role;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  organization?: string;

  @Column({ nullable: true })
  badgeNumber?: string;

  @Column({ nullable: true })
  assignedTeamId?: string;

  @Column({ nullable: true })
  assignedZone?: string;

  @Column("simple-array", { default: "" })
  skills!: string[];

  @Column("jsonb", { nullable: true })
  location?: {
    name?: string;
    lat?: number;
    lng?: number;
  };

  @Column({ default: "approved" })
  status!: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;
}
