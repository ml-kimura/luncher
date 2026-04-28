table "lunch_dates" {
  schema = schema.public
  comment = <<-JSON
  {
    "logical_name": "開催日",
    "description": "コラボランチの開催日（JST）を 1 行 1 日で管理する。案内投稿後の重複起動時は同じ行を参照して Slack 重複投稿を防ぐ。",
    "i18n": {
      "en": {
        "logical_name": "Lunch date (session day)",
        "description": "Stores collaborative lunch session dates (JST), one row per day. Duplicate batch runs after the announcement reuse the same row to prevent duplicate Slack posts."
      }
    }
  }
  JSON

  column "lunch_date" {
    type = sql("date")
    null = false
    comment = <<-JSON
    {
      "logical_name": "開催日",
      "description": "主キー。当日の枠の識別子。",
      "i18n": {
        "en": {
          "logical_name": "Lunch date",
          "description": "Primary key. Identifies the session day."
        }
      }
    }
    JSON
  }

  column "slack_message_ts" {
    type = sql("text")
    null = true
    comment = <<-JSON
    {
      "logical_name": "SlackメッセージID",
      "description": "chat.postMessage の ts。投稿成功後に設定。重複起動時は非NULLなら新規投稿を行わない。",
      "i18n": {
        "en": {
          "logical_name": "Slack message ts",
          "description": "Slack message ts; if set, duplicate runs skip posting."
        }
      }
    }
    JSON
  }

  column "slack_channel_id" {
    type = sql("text")
    null = true
    comment = <<-JSON
    {
      "logical_name": "SlackチャンネルID",
      "description": "投稿先チャンネル。",
      "i18n": {
        "en": {
          "logical_name": "Slack channel ID",
          "description": "Channel of the posted message."
        }
      }
    }
    JSON
  }

  column "created_at" {
    type = sql("timestamptz")
    null = false
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
    columns = [column.lunch_date]
  }
}
