---
title: 日次コラボランチ案内（内部ジョブ）
description: スケジューラから起動し、BAT-001 の業務を実行する内部 API（US-001）
---

# 日次コラボランチ案内（内部ジョブ）

## 概要

スケジューラ（EventBridge 等）から内部向けに呼び出され、[BAT-001 日次コラボランチ案内配信](../../batch/design/bat-001.md) と同一の業務を実行する。フロント利用者向けの公開 API ではない。

- 対象ユーザーストーリー: `US-001`

## エンドポイント一覧

| Method | Path                                      | operationId                                                       | 概要                       |
| ------ | ----------------------------------------- | ----------------------------------------------------------------- | -------------------------- |
| `POST` | `/internal/jobs/daily-lunch-announcement` | [`postDailyLunchAnnouncementJob`](#postDailyLunchAnnouncementJob) | 日次コラボランチ案内の実行 |

---

## エンドポイント別仕様

### postDailyLunchAnnouncementJob {#postDailyLunchAnnouncementJob}

| 項目          | 値                                                                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Method / Path | <InternalLink path="/api/app/operations/postDailyLunchAnnouncementJob">POST /internal/jobs/daily-lunch-announcement</InternalLink> |
| operationId   | <InternalLink path="/api/app/operations/postDailyLunchAnnouncementJob">postDailyLunchAnnouncementJob</InternalLink>                |
| 概要          | 当日のコラボランチ案内を Slack に投稿する。                                                                                        |

#### 認証・不正呼び出し防止

- 内部ネットワーク、mTLS、または HMAC 付き共有シークレットなどインフラ方針に合わせて保護する。
- Security Baseline 拡張が有効な場合はセキュリティ設計のチェックリストに沿って具体化する。

#### リクエスト

| フィールド  | 型              | 必須   | 説明                                                |
| ----------- | --------------- | ------ | --------------------------------------------------- |
| `lunchDate` | `string` (date) | いいえ | 未指定時は当日（JST）。再実行・テスト用に上書き可。 |

#### 業務ルール

1. `lunch_dates` テーブルに当日レコードを upsert し、ロックを取得する。
2. 既に `slack_message_ts` がある場合は重複投稿を抑止し、`skipped: true` を返す。
3. 投稿成功時は `slack_message_ts` / `slack_channel_id` を保存する。
4. 監査ログコード I-BAT-101 / W-BAT-101 / E-BAT-101 はバッチ側で出力する。

#### レスポンス（例）

`200` - 正常終了（投稿した、または重複抑止でスキップした）

```json
{
  "status": "ok",
  "lunchDate": "2026-04-28",
  "skipped": false,
  "slackMessageTs": "1234567890.123456"
}
```

`skipped: true` のときは、既存行の `slack_message_ts` が非 NULL のため新規投稿を行わなかったケース。

#### エラー

| HTTP          | コード                                                                                                                                                | 条件                   |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `401` / `403` | <InternalLink path="api/messages.html#E-API-002">E-API-002</InternalLink> / <InternalLink path="api/messages.html#E-API-003">E-API-003</InternalLink> | 認証・認可エラー       |
| `500`         | <InternalLink path="api/messages.html#F-API-001">F-API-001</InternalLink>                                                                             | Slack または DB エラー |

---

## 関連

- ユーザーストーリー: <InternalLink path="user-stories/us-001.html">US-001</InternalLink>
- 関連バッチ: <InternalLink path="batch/design/bat-001.html">BAT-001 日次コラボランチ案内配信</InternalLink>
- 関連DB: <InternalLink path="database/pdm/table/lunch_dates.html">lunch_dates</InternalLink>
