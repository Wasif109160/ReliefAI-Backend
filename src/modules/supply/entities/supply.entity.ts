import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import * as crypto from "crypto";

@Entity({ name: "supplies" })
export class SupplyItem {
  @PrimaryColumn({ type: "varchar" })
  id: string = crypto.randomUUID();

  @Column()
  name!: string;

  @Column()
  category!: string;

  @Column({ type: "int" })
  quantity!: number;

  @Column()
  unit!: string;

  @Column()
  warehouseLocation!: string;

  @Column({ default: "adequate" })
  status!: string;

  @Column({ type: "int", default: 50 })
  threshold!: number;

  @Column({ type: "int", default: 0 })
  allocated!: number;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;
}
