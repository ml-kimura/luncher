---
title: レシートOCR補助 API
description: US-005 のレシートアップロードとOCR解析 API 補足設計
---

# レシートOCR補助 API

## 対象 API

- `POST /receipts/upload` (`uploadReceipt`)
- `POST /receipts/analyze` (`analyzeReceipt`)

## 概要

ランチ申請者（支払実行者）がレシート画像をアップロードし、OCR 抽出結果を確認・補正可能にするための API 群。  
本書は `api/design` の補足として、US-005 の I/O とエラー契約を明示する。

## API1: uploadReceipt

### リクエスト

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | -- | ---- |
| `lunchId` | `string` | はい | 対象ランチ識別子 |
| `fileName` | `string` | はい | 元ファイル名 |
| `contentType` | `string` | はい | 例: `image/jpeg`, `image/png` |
| `fileBase64` | `string` | はい | レシート画像データ（Base64） |

### レスポンス（例）

`201` — アップロード受付完了

```json
{
  "receiptId": "rcpt_01HSX8W0A1M2",
  "lunchId": "lunch_2026-04-28_a",
  "storedAt": "2026-04-28T12:10:20+09:00"
}
```

### エラー

| HTTP | 条件 |
| ---- | ---- |
| `400` | フォーマット不正（拡張子・MIME・サイズ） |
| `401` / `403` | 認証失敗、または権限不足 |
| `404` | `lunchId` が存在しない |
| `413` | ファイルサイズ上限超過 |
| `500` | ストレージ保存失敗 |

## API2: analyzeReceipt

### リクエスト

| フィールド | 型 | 必須 | 説明 |
| ---------- | -- | -- | ---- |
| `receiptId` | `string` | はい | `uploadReceipt` で発行されたID |
| `languageHint` | `string` | いいえ | OCR言語ヒント（例: `ja`, `en`） |

### レスポンス（例）

`200` — OCR 結果取得完了

```json
{
  "receiptId": "rcpt_01HSX8W0A1M2",
  "extracted": {
    "storeName": "Cafe Example",
    "visitedAt": "2026-04-28T12:03:00+09:00",
    "totalAmount": 4200,
    "currency": "JPY"
  },
  "confidence": {
    "storeName": 0.92,
    "visitedAt": 0.87,
    "totalAmount": 0.95
  },
  "fallbackRequired": false
}
```

`fallbackRequired: true` は OCR 失敗または信頼度不足を示し、UI は手入力モードへフォールバックする。

### エラー

| HTTP | 条件 |
| ---- | ---- |
| `400` | `receiptId` 形式不正 |
| `401` / `403` | 認証失敗、または権限不足 |
| `404` | `receiptId` が存在しない |
| `422` | OCR 解析不能（入力画像破損など） |
| `500` | OCR サービス障害 |

## 認可ルール

- 編集・再解析を含む一連の操作は、当該ランチの **支払実行者** に限定する。
- 監査のため、`actor`, `lunchId`, `receiptId` を構造化ログに記録する。

## OpenAPI 反映方針

- path / `operationId` は `public/openapi/openapi-app.yml` に反映する。
- 仕様更新時は、リクエスト・レスポンス例を本書と OpenAPI で同期する。
