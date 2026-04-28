-- Modify "lunch_dates" table
ALTER TABLE "public"."lunch_dates" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP, ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
-- Modify "system_configs" table
ALTER TABLE "public"."system_configs" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP, ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;
