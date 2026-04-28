---
title: 割り当て後の欠席登録 API
description: US-004（割り当て後の欠席）におけるグループ除外と通知更新を行う API 補足
---

# 割り当て後の欠席登録 API

## エンドポイント

- `POST /lunches/{lunchId}/groups/absence`

## operationId

- `postGroupAbsence`

## 概要

マッチング済みグループの参加者が欠席リアクションを行った際に、対象メンバーをグループから除外する。除外成功時は更新後のグループ情報を Slack 通知に反映する。

## リクエスト

### Path Parameters

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | ---- | ---- |
| `lunchId` | `string` | はい | 対象ランチ ID |

### Body

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | ---- | ---- |
| `memberSlackUserId` | `string` | はい | 欠席するメンバーの Slack ユーザー ID |
| `triggerMessageTs` | `string` | はい | 欠席リアクションが付与された元メッセージの Slack TS |
| `reason` | `string` | いいえ | 任意の欠席理由（監査ログ向け） |

## レスポンス（例）

`200` — 欠席除外が反映され、更新後のグループ情報を返す

```json
{
  "status": "updated",
  "lunchId": "LUNCH-20260428",
  "removedMemberSlackUserId": "U12345678",
  "alreadyAbsent": false,
  "group": {
    "groupId": "GROUP-01",
    "members": ["U23456789", "U34567890", "U45678901"]
  },
  "slackNotification": {
    "updated": true,
    "messageTs": "1714261200.123456"
  }
}
```

`alreadyAbsent: true` の場合は、対象メンバーが既に除外済みであるため状態変更なし。

## エラー

| HTTP | 条件 |
| ---- | ---- |
| `400` | 不正なリクエスト（必須欠落、型不正） |
| `403` | 対象ランチの参加者ではない |
| `404` | 対象ランチまたは対象メンバーが存在しない |
| `409` | 既に最終確定済みで欠席変更不可 |
| `500` | DB または Slack 更新処理で失敗 |

## 関連

- ユーザーストーリー: [US-004](../../user-stories/us-004.md)
- OpenAPI: [`openapi-app.yml`](../../../../public/openapi/openapi-app.yml)
