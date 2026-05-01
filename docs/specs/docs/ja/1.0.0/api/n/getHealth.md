---
title: ヘルスチェック
description: サービス稼働と DB 接続を確認する内部 API
---

# ヘルスチェック

## 概要

サービス稼働と DB 接続を確認する API。  
DB に対して検索を実行し、結果を返戻。

## エンドポイント一覧

| Method | Path      | operationId               | 概要                         |
| ------ | --------- | ------------------------- | ---------------------------- |
| `GET`  | `/health` | [`getHealth`](#getHealth) | サービス稼働と DB 接続を確認 |

## エンドポイント別仕様

### getHealth {#getHealth}

| 項目          | 値                                                                            |
| ------------- | ----------------------------------------------------------------------------- |
| Method / Path | <InternalLink path="/api/app/operations/getHealth">GET /health</InternalLink> |
| operationId   | <InternalLink path="/api/app/operations/getHealth">getHealth</InternalLink>   |
| 概要          | サービス稼働と DB 接続を確認する。                                            |

#### 認証・不正呼び出し防止

なし。

#### リクエスト

なし。

#### 業務ルール

なし。

#### 処理の流れ

1. ヘルスチェック要求を受け取り、DB に対して `select 1` を実行する。
2. DB 接続確認に成功した場合は `status: ok` を返す。
3. DB 接続確認に失敗した場合は `status: error` とエラーコードを返す。

#### レスポンス（例）

`200` - DB 接続確認に成功

```json
{
  "status": "ok"
}
```

`500` - DB 接続確認に失敗

```json
{
  "status": "error",
  "code": "F-API-001",
  "message": "internal error"
}
```

#### エラー

| HTTP  | コード                                                                    | 条件         |
| ----- | ------------------------------------------------------------------------- | ------------ |
| `500` | <InternalLink path="api/messages.html#F-API-001">F-API-001</InternalLink> | DB接続失敗時 |
