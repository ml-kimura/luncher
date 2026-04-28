---
title: 写真リプライ受信による精算テキスト生成（内部イベント）
description: Slack 写真リプライを受信し、親スレッドへ経費精算テキストを返信する内部 API（US-006）
---

# 写真リプライ受信による精算テキスト生成（内部イベント）

## エンドポイント

- `POST /internal/slack/events/receipt-reply`

## operationId

- `postReceiptExpenseAssistFromSlackReply`

## 概要

Slack のイベント連携から「写真付きリプライ」を受信し、対象スレッドの文脈を検証して経費精算入力向けテキストを生成・返信する。公開 API ではなく **内部イベント受信用** のエンドポイント。

## 処理境界（US-006）

- 本 API の責務:
  - 写真付きリプライかどうかの判定
  - 親メッセージへの画像反映（または画像参照更新）
  - 精算入力用テキストの生成と 1 回返信
  - 冪等性（同一イベント重複受信の抑止）
- 本 API の対象外:
  - 経費申請 SaaS への本登録・送信
  - マッチング結果そのものの再計算・再編成

## リクエスト

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | ---- | ---- |
| `eventId` | `string` | はい | Slack イベントの一意 ID（冪等キー） |
| `channelId` | `string` | はい | 対象チャンネル ID |
| `threadTs` | `string` | はい | 親スレッド TS |
| `replyTs` | `string` | はい | リプライメッセージ TS |
| `replyUserId` | `string` | はい | リプライ投稿者の Slack ユーザー ID |
| `imageFileIds` | `string[]` | はい | 添付画像ファイル ID。1 件以上必須 |
| `occurredAt` | `string` (`date-time`) | いいえ | 受信イベント発生時刻 |

## レスポンス（例）

`202` — 非同期受理（返信投稿までを同一処理で完了）

```json
{
  "status": "accepted",
  "eventId": "Ev03ABCD1234",
  "expenseReplyTs": "1745820011.123456",
  "alreadyProcessed": false
}
```

`alreadyProcessed: true` は重複受信時に副作用を再実行しなかったケース。

## エラー

| HTTP | 条件 |
| ---- | ---- |
| `400` | `imageFileIds` が空、または写真添付なし |
| `409` | `eventId` が既処理（冪等性により拒否） |
| `422` | 対象スレッドが精算テキスト生成条件を満たさない |
| `500` | Slack API / 画像取得 / テキスト生成処理の内部エラー |

## OpenAPI

- 本仕様の path / `operationId` は [`openapi-app.yml`](../../../../public/openapi/openapi-app.yml) に反映する。

## 関連

- ユーザーストーリー: [US-006](../../user-stories/us-006.md)
