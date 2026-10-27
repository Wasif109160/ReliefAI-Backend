import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "shelters" })
export class Shelter {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column("float")
  lat!: number;

  @Column("float")
  lng!: number;

  @Column({ type: "int" })
  capacity!: number;

  @Column({ type: "int", default: 0 })
  currentOccupancy!: number;

  @Column({ default: false })
  hasMedical!: boolean;

  @Column({ default: true })
  hasFood!: boolean;

  @Column({ default: true })
  hasWater!: boolean;

  @Column({ default: false })
  hasPower!: boolean;

  @Column({ default: false })
  isPetFriendly!: boolean;

  @Column({ default: true })
  hasSupplies!: boolean;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({ nullable: true })
  managedByNGO?: string;

  @Column({ default: "open" })
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
