import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "auth_sessions" })
export class AuthSession {
  @PrimaryColumn("uuid")
  id!: string;

  @Index()
  @Column("uuid")
  userId!: string;

  @Column({ select: false })
  refreshTokenHash!: string;

  @Column("timestamp")
  expiresAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  revokedAt!: Date | null;
}
