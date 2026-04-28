---
title: 参加表明受付（Slackリアクション）
description: Slack リアクションイベントを受けて、当日参加者を登録・解除する API（US-002）
---

# 参加表明受付（Slackリアクション）

## エンドポイント

- `POST /internal/events/lunch-entry-reaction`

## operationId

- `postLunchEntryReaction`

## 概要

Slack の募集メッセージに対するリアクション追加/解除イベントを受け取り、当日ランチの参加対象を更新する内部 API。  
US-002 の対象は **参加表明受付まで** であり、グループ編成（US-003）は対象外。

## 認証・不正呼び出し防止

- Slack 署名検証（`X-Slack-Signature`, `X-Slack-Request-Timestamp`）を必須とする。
- さらに内部向け API Gateway 制御（IP 制限や mTLS など）を適用して多層防御する。

## リクエスト

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | -- | ---- |
| `eventId` | `string` | はい | イベント重複抑止用キー（Slack Event ID） |
| `eventType` | `string` | はい | `reaction_added` または `reaction_removed` |
| `reaction` | `string` | はい | 対象リアクション名（参加表明用） |
| `lunchDate` | `string` (date) | はい | 対象日（JST） |
| `slackUserId` | `string` | はい | 参加者の Slack User ID |
| `channelId` | `string` | はい | 募集メッセージのチャンネル ID |
| `messageTs` | `string` | はい | 募集メッセージの ts |
| `occurredAt` | `string` (date-time) | はい | Slack 上での発生時刻 |

## 業務ルール

1. 締切後のイベントは `rejected` として受理し、参加状態は変更しない。
2. 月次上限（1名あたり月2回）超過時は `rejected` として受理し、参加状態は変更しない。
3. `reaction_added` は冪等に扱い、既登録なら `no_change` を返す。
4. `reaction_removed` は既存参加を取り消し、未登録なら `no_change` を返す。

## レスポンス（例）

`200` - 正常にイベントを処理（更新あり/なし、拒否含む）

```json
{
  "status": "ok",
  "result": "accepted",
  "lunchDate": "2026-04-28",
  "slackUserId": "U12345678",
  "attendanceStatus": "joined"
}
```

`result` は次のいずれか:
- `accepted`（参加状態を更新）
- `no_change`（冪等処理で変更なし）
- `rejected`（締切/上限等で不受理）

## エラー

| HTTP | 条件 |
| ---- | ---- |
| `400` | 必須項目欠落、`eventType` 不正 |
| `401` / `403` | 署名検証失敗・内部認可失敗 |
| `409` | 同一 `eventId` の競合（重複処理） |
| `500` | DB 更新失敗などの内部エラー |

## OpenAPI

- path と `operationId` は [`openapi-app.yml`](../../../../public/openapi/openapi-app.yml) と整合させる。

## 関連

- ユーザーストーリー: [US-002](../../user-stories/us-002.md)
- 先行仕様: [US-001 日次案内](./postDailyLunchAnnouncement.md)
