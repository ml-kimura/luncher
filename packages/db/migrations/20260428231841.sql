-- Set comment to table: "lunch_dates"
COMMENT ON TABLE "public"."lunch_dates" IS '{
  "logical_name": "開催日",
  "description": "コラボランチの開催日（JST）を 1 行 1 日で管理する。案内投稿後の重複起動時は同じ行を参照して Slack 重複投稿を防ぐ。",
  "i18n": {
    "en": {
      "logical_name": "Lunch date (session day)",
      "description": "Stores collaborative lunch session dates (JST), one row per day. Duplicate batch runs after the announcement reuse the same row to prevent duplicate Slack posts."
    }
  }
}
';
-- Create "system_configs" table
CREATE TABLE "public"."system_configs" ("config_key" text NOT NULL, "effective_from" date NOT NULL, "config_value" jsonb NOT NULL, "created_at" timestamptz NOT NULL, "updated_at" timestamptz NOT NULL, PRIMARY KEY ("config_key", "effective_from"));
-- Set comment to table: "system_configs"
COMMENT ON TABLE "public"."system_configs" IS '{
  "logical_name": "システム設定",
  "description": "システム全体で参照する設定値を、設定キーごとに適用開始日付きで管理する。指定した effective_from 以降で有効化される設定を保持する。",
  "i18n": {
    "en": {
      "logical_name": "System configurations",
      "description": "Stores system-wide configuration values per key with effective start dates. A row becomes active from effective_from."
    }
  }
}
';
-- Set comment to column: "config_key" on table: "system_configs"
COMMENT ON COLUMN "public"."system_configs"."config_key" IS '{
  "logical_name": "設定キー",
  "description": "設定項目の識別子。例: matching.weights, subsidy.limit",
  "i18n": {
    "en": {
      "logical_name": "Configuration key",
      "description": "Identifier of the config item, e.g. matching.weights, subsidy.limit."
    }
  }
}
';
-- Set comment to column: "effective_from" on table: "system_configs"
COMMENT ON COLUMN "public"."system_configs"."effective_from" IS '{
  "logical_name": "適用開始日",
  "description": "この設定が有効になる日付（JST想定）。",
  "i18n": {
    "en": {
      "logical_name": "Effective from",
      "description": "Date when this config starts to be effective (expected in JST)."
    }
  }
}
';
-- Set comment to column: "config_value" on table: "system_configs"
COMMENT ON COLUMN "public"."system_configs"."config_value" IS '{
  "logical_name": "設定値",
  "description": "設定の実体。スカラー値または構造化オブジェクトをJSON形式で保持する。",
  "i18n": {
    "en": {
      "logical_name": "Configuration value",
      "description": "Actual config payload in JSON (scalar or structured object)."
    }
  }
}
';
-- Set comment to column: "created_at" on table: "system_configs"
COMMENT ON COLUMN "public"."system_configs"."created_at" IS '{
  "logical_name": "作成日時",
  "description": "行の作成日時。",
  "i18n": {
    "en": {
      "logical_name": "Created at",
      "description": "Row creation time."
    }
  }
}
';
-- Set comment to column: "updated_at" on table: "system_configs"
COMMENT ON COLUMN "public"."system_configs"."updated_at" IS '{
  "logical_name": "更新日時",
  "description": "行の最終更新日時。",
  "i18n": {
    "en": {
      "logical_name": "Updated at",
      "description": "Last update time."
    }
  }
}
';
