import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableIndex,
} from "typeorm";
import { TableOptions } from "typeorm/schema-builder/options/TableOptions";

// Frozen schema snapshot. Do not import current entities into historical migrations.
const schema: TableOptions[] = [
  {
    name: "auth_sessions",
    columns: [
      {
        name: "id",
        type: "uuid",
        isPrimary: true,
      },
      {
        name: "user_id",
        type: "uuid",
      },
      {
        name: "refresh_token_hash",
        type: "varchar",
      },
      {
        name: "expires_at",
        type: "timestamp",
      },
      {
        name: "revoked_at",
        type: "timestamp",
        isNullable: true,
      },
    ],
  },
  {
    name: "disasters",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "title",
        type: "varchar",
      },
      {
        name: "bangla_title",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "type",
        type: "varchar",
        default: "'flood'",
      },
      {
        name: "severity",
        type: "varchar",
        default: "'moderate'",
      },
      {
        name: "status",
        type: "varchar",
        default: "'active'",
      },
      {
        name: "data_source",
        type: "varchar",
        default: "'demo'",
      },
      {
        name: "is_demo",
        type: "boolean",
        default: "false",
      },
      {
        name: "citation",
        type: "jsonb",
        isNullable: true,
      },
      {
        name: "location",
        type: "jsonb",
        isNullable: true,
      },
      {
        name: "affected_population",
        type: "integer",
        default: "0",
      },
      {
        name: "casualties_reported",
        type: "integer",
        default: "0",
      },
      {
        name: "responders_deployed",
        type: "integer",
        default: "0",
      },
      {
        name: "reported_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
      },
      {
        name: "description",
        type: "text",
        isNullable: true,
      },
      {
        name: "recommended_evacuation_radius_km",
        type: "double precision",
        isNullable: true,
      },
      {
        name: "active_hazards",
        type: "text",
        default: "''",
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "donations",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "donor_name",
        type: "varchar",
      },
      {
        name: "donor_email",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "amount",
        type: "double precision",
      },
      {
        name: "currency",
        type: "varchar",
        default: "'BDT'",
      },
      {
        name: "allocated_cause",
        type: "varchar",
      },
      {
        name: "impact_metric",
        type: "varchar",
      },
      {
        name: "tx_hash",
        type: "varchar",
      },
      {
        name: "channel",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "is_verified",
        type: "boolean",
        default: "true",
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "ngo_applications",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "organization_name",
        type: "varchar",
      },
      {
        name: "registration_number",
        type: "varchar",
        isUnique: true,
      },
      {
        name: "focal_person_name",
        type: "varchar",
      },
      {
        name: "focal_person_email",
        type: "varchar",
      },
      {
        name: "focal_person_phone",
        type: "varchar",
      },
      {
        name: "website",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "hq_address",
        type: "varchar",
      },
      {
        name: "operational_districts",
        type: "text",
        default: "''",
      },
      {
        name: "relief_capabilities",
        type: "text",
        default: "''",
      },
      {
        name: "document_name",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "document_data",
        type: "text",
        isNullable: true,
      },
      {
        name: "status",
        type: "varchar",
        default: "'pending'",
      },
      {
        name: "admin_notes",
        type: "text",
        isNullable: true,
      },
      {
        name: "reviewed_by",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "reviewed_at",
        type: "timestamp",
        isNullable: true,
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "responder_teams",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "name",
        type: "varchar",
      },
      {
        name: "lead_name",
        type: "varchar",
      },
      {
        name: "type",
        type: "varchar",
        default: "'search_rescue'",
      },
      {
        name: "members_count",
        type: "integer",
        default: "4",
      },
      {
        name: "status",
        type: "varchar",
        default: "'available'",
      },
      {
        name: "current_incident_id",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "assigned_sos_id",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "current_location",
        type: "jsonb",
      },
      {
        name: "radio_freq",
        type: "varchar",
        default: "'156.800 MHz'",
      },
      {
        name: "equipment",
        type: "text",
        default: "''",
      },
      {
        name: "last_check_in",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP",
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "shelters",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "name",
        type: "varchar",
      },
      {
        name: "address",
        type: "varchar",
      },
      {
        name: "lat",
        type: "double precision",
      },
      {
        name: "lng",
        type: "double precision",
      },
      {
        name: "capacity",
        type: "integer",
      },
      {
        name: "current_occupancy",
        type: "integer",
        default: "0",
      },
      {
        name: "has_medical",
        type: "boolean",
        default: "false",
      },
      {
        name: "has_food",
        type: "boolean",
        default: "true",
      },
      {
        name: "has_water",
        type: "boolean",
        default: "true",
      },
      {
        name: "has_power",
        type: "boolean",
        default: "false",
      },
      {
        name: "is_pet_friendly",
        type: "boolean",
        default: "false",
      },
      {
        name: "has_supplies",
        type: "boolean",
        default: "true",
      },
      {
        name: "contact_phone",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "managed_by_ngo",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "status",
        type: "varchar",
        default: "'open'",
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "sos_requests",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "reporter_name",
        type: "varchar",
      },
      {
        name: "phone",
        type: "varchar",
      },
      {
        name: "contact_phone",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "disaster_id",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "location",
        type: "jsonb",
      },
      {
        name: "urgency_score",
        type: "double precision",
        default: "50",
      },
      {
        name: "priority",
        type: "varchar",
        default: "'MEDIUM'",
      },
      {
        name: "status",
        type: "varchar",
        default: "'pending'",
      },
      {
        name: "details",
        type: "text",
      },
      {
        name: "description",
        type: "text",
        isNullable: true,
      },
      {
        name: "image_url",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "trapped_count",
        type: "integer",
        default: "0",
      },
      {
        name: "injuries_count",
        type: "integer",
        default: "0",
      },
      {
        name: "special_needs",
        type: "text",
        default: "''",
      },
      {
        name: "needs_boat",
        type: "boolean",
        default: "false",
      },
      {
        name: "needs_medical",
        type: "boolean",
        default: "false",
      },
      {
        name: "needs_food_water",
        type: "boolean",
        default: "false",
      },
      {
        name: "assigned_team_id",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "assigned_team_name",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "ai_triage_summary",
        type: "text",
        isNullable: true,
      },
      {
        name: "dispatch_eta_minutes",
        type: "integer",
        isNullable: true,
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "supplies",
    columns: [
      {
        name: "id",
        type: "varchar",
        isPrimary: true,
      },
      {
        name: "name",
        type: "varchar",
      },
      {
        name: "category",
        type: "varchar",
      },
      {
        name: "quantity",
        type: "integer",
      },
      {
        name: "unit",
        type: "varchar",
      },
      {
        name: "warehouse_location",
        type: "varchar",
      },
      {
        name: "status",
        type: "varchar",
        default: "'adequate'",
      },
      {
        name: "threshold",
        type: "integer",
        default: "50",
      },
      {
        name: "allocated",
        type: "integer",
        default: "0",
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
  {
    name: "users",
    columns: [
      {
        name: "id",
        type: "uuid",
        isPrimary: true,
        isGenerated: true,
        generationStrategy: "uuid",
      },
      {
        name: "name",
        type: "varchar",
      },
      {
        name: "display_name",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "email",
        type: "varchar",
        isUnique: true,
      },
      {
        name: "password",
        type: "varchar",
      },
      {
        name: "role",
        type: "enum",
        enum: [
          "super_admin",
          "admin",
          "ngo",
          "volunteer",
          "citizen",
          "rescue_team",
          "government",
          "commander",
          "responder",
        ],
        default: "'citizen'",
      },
      {
        name: "is_email_verified",
        type: "boolean",
        default: "false",
      },
      {
        name: "phone",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "organization",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "badge_number",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "assigned_team_id",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "assigned_zone",
        type: "varchar",
        isNullable: true,
      },
      {
        name: "skills",
        type: "text",
        default: "''",
      },
      {
        name: "location",
        type: "jsonb",
        isNullable: true,
      },
      {
        name: "status",
        type: "varchar",
        default: "'approved'",
      },
      {
        name: "created_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
      {
        name: "updated_at",
        type: "timestamp",
        default: "CURRENT_TIMESTAMP(6)",
      },
    ],
  },
];

export class CompletePlatformSchema1793200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const definition of schema) {
      if (!(await queryRunner.hasTable(definition.name))) {
        await queryRunner.createTable(new Table(definition), true);
      } else if (definition.name === "users") {
        for (const column of definition.columns || []) {
          if (!(await queryRunner.hasColumn("users", column.name))) {
            await queryRunner.addColumn("users", new TableColumn(column));
          }
        }
      }
    }
    await queryRunner.createIndex(
      "auth_sessions",
      new TableIndex({
        name: "IDX_auth_sessions_user_id",
        columnNames: ["user_id"],
      }),
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // A rollback must not silently destroy emergency records or existing schemas.
    throw new Error(
      "Restore the pre-migration backup for a data-preserving rollback",
    );
  }
}
