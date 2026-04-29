---
title: ヘルスチェック
description: ヘルスチェック
---

# ヘルスチェック

## エンドポイント

- <InternalLink path="/api/app/operations/getHealth">GET /health</InternalLink>

## 概要

サービス稼働と DB 接続を確認する API です。DB に対して `select 1` を実行し、成功時は `200`、失敗時は `500` を返します。

## レスポンス例

```json
{
  "status": "ok"
}
```

```json
{
  "status": "error"
}
```
