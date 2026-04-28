---
title: 日次コラボランチ案内（内部ジョブ）
description: スケジューラから起動し、BAT-001 の業務を実行する API（US-001）
---

# 日次コラボランチ案内（内部ジョブ）

## エンドポイント

- `POST /internal/jobs/daily-lunch-announcement`

## operationId

- `postDailyLunchAnnouncementJob`

## 概要

[BAT-001: 日次コラボランチ案内配信](../../batch/design/bat-001.md) と同一の業務。EventBridge 等のスケジューラが本エンドポイントを **内部向け** に呼び出す。フロント利用者向けの公開 API ではない。

## 認証・不正呼び出し防止

- 本番では **内部ネットワーク**、**mTLS**、または **HMAC 付き共有シークレット** 等、インフラ方針に合わせて保護する（Security Baseline 拡張が有効な場合はセキュリティ設計のチェックリストに沿って具体化する）。

## リクエスト

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | -- | ---- |
| `lunchDate` | `string` (date) | いいえ | 未指定時は **当日（JST）** を用いる。再実行・テスト用に上書き可 |

## レスポンス（例）

`200` — 正常終了（投稿した、または重複抑止でスキップした）

```json
{
  "status": "ok",
  "lunchDate": "2026-04-28",
  "skipped": false,
  "slackMessageTs": "1234567890.123456"
}
```

`skipped: true` のときは、既存行の `slack_message_ts` が非 NULL のため新規投稿を行わなかったケース。

## エラー

| HTTP | 条件 |
| ---- | ---- |
| `401` / `403` | 認証失敗 |
| `500` | Slack または DB エラー（リトライ方針は運用定義） |

## OpenAPI

- 本仕様の path / `operationId` は [`openapi-app.yml`](../../../../public/openapi/openapi-app.yml) に反映する（`requirements` FR-02）。

## 関連

- ユーザーストーリー: [US-001](../../user-stories/us-001.md)
- テーブル: [lunch_dates](../../database/pdm/table/lunch_dates)（リポジトリルートの `luncher-system-design-draft.md` §4 の `lunch_dates` と対応）
