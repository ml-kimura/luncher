table "system_configs" {
  schema = schema.public
  comment = <<-JSON
  {
    "logical_name": "システム設定",
    "description": "システム全体で参照する設定値を、設定キーごとに適用開始日付きで管理する。指定した effective_from 以降で有効化される設定を保持する。",
    "i18n": {
      "en": {
        "logical_name": "System configurations",
        "description": "Stores system-wide configuration values per key with effective start dates. A row becomes active from effective_from."
      }
    }
  }
  JSON

  column "config_key" {
    type = sql("text")
    null = false
    comment = <<-JSON
    {
      "logical_name": "設定キー",
      "description": "設定項目の識別子。例: matching.weights, subsidy.limit",
      "i18n": {
        "en": {
          "logical_name": "Configuration key",
          "description": "Identifier of the config item, e.g. matching.weights, subsidy.limit."
        }
      }
    }
    JSON
  }

  column "effective_from" {
    type = sql("date")
    null = false
    comment = <<-JSON
    {
      "logical_name": "適用開始日",
      "description": "この設定が有効になる日付（JST想定）。",
      "i18n": {
        "en": {
          "logical_name": "Effective from",
          "description": "Date when this config starts to be effective (expected in JST)."
        }
      }
    }
    JSON
  }

  column "config_value" {
    type = sql("jsonb")
    null = false
    comment = <<-JSON
    {
      "logical_name": "設定値",
      "description": "設定の実体。スカラー値または構造化オブジェクトをJSON形式で保持する。",
      "i18n": {
        "en": {
          "logical_name": "Configuration value",
          "description": "Actual config payload in JSON (scalar or structured object)."
        }
      }
    }
    JSON
  }

  column "created_at" {
    type = sql("timestamptz")
    null = false
    default = sql("current_timestamp")
    comment = <<-JSON
    {
      "logical_name": "作成日時",
      "description": "行の作成日時。",
      "i18n": {
        "en": {
          "logical_name": "Created at",
          "description": "Row creation time."
        }
      }
    }
    JSON
  }

  column "updated_at" {
    type = sql("timestamptz")
    null = false
    default = sql("current_timestamp")
    comment = <<-JSON
    {
      "logical_name": "更新日時",
      "description": "行の最終更新日時。",
      "i18n": {
        "en": {
          "logical_name": "Updated at",
          "description": "Last update time."
        }
      }
    }
    JSON
  }

  primary_key {
    columns = [column.config_key, column.effective_from]
  }
}
