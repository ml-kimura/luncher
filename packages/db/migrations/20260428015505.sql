-- Create "lunch_dates" table
CREATE TABLE "lunch_dates" ("lunch_date" date NOT NULL, "slack_message_ts" text NULL, "slack_channel_id" text NULL, "created_at" timestamptz NOT NULL, "updated_at" timestamptz NOT NULL, PRIMARY KEY ("lunch_date"));
-- Set comment to table: "lunch_dates"
COMMENT ON TABLE "lunch_dates" IS '{
  "logical_name": "開催日",
  "description": "コラボランチの開催日（カレンダー日・JST）を 1 行 1 日で管理する。`luncher-system-design-draft.md` のデータモデル `lunch_dates` に対応。日次案内バッチ（BAT-001）が行を追加し、案内投稿後の重複起動時は同じ行を参照して Slack 重複投稿を防ぐ。",
  "i18n": {
    "en": {
      "logical_name": "Lunch date (session day)",
      "description": "One row per calendar day (JST) per system design. Daily announcement batch BAT-001; deduplication using slack_message_ts on this row."
    }
  }
}
';
-- Set comment to column: "lunch_date" on table: "lunch_dates"
COMMENT ON COLUMN "lunch_dates"."lunch_date" IS '{
  "logical_name": "開催日",
  "description": "主キー。当日の枠の識別子。",
  "i18n": {
    "en": {
      "logical_name": "Lunch date",
      "description": "Primary key. Identifies the session day."
    }
  }
}
';
-- Set comment to column: "slack_message_ts" on table: "lunch_dates"
COMMENT ON COLUMN "lunch_dates"."slack_message_ts" IS '{
  "logical_name": "SlackメッセージID",
  "description": "chat.postMessage の ts。投稿成功後に設定。重複起動時は非NULLなら新規投稿を行わない。",
  "i18n": {
    "en": {
      "logical_name": "Slack message ts",
      "description": "Slack message ts; if set, duplicate runs skip posting."
    }
  }
}
';
-- Set comment to column: "slack_channel_id" on table: "lunch_dates"
COMMENT ON COLUMN "lunch_dates"."slack_channel_id" IS '{
  "logical_name": "SlackチャンネルID",
  "description": "投稿先チャンネル。",
  "i18n": {
    "en": {
      "logical_name": "Slack channel ID",
      "description": "Channel of the posted message."
    }
  }
}
';
-- Set comment to column: "created_at" on table: "lunch_dates"
COMMENT ON COLUMN "lunch_dates"."created_at" IS '{
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
-- Set comment to column: "updated_at" on table: "lunch_dates"
COMMENT ON COLUMN "lunch_dates"."updated_at" IS '{
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
