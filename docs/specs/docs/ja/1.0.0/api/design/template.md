---
title: API設計テンプレート
description: API設計補足ドキュメントを追加する際の標準テンプレート（複数エンドポイント対応）
---

# API設計テンプレート

> このテンプレートは `docs/specs/docs/public/openapi/openapi-app.yml` を正として、業務補足を追加するためのものです。
> 1ファイルに複数エンドポイントを含められる構成です。`operationId` を明示アンカー `{#operationId}` として付与しているため、エンドポイント一覧の表からエンドポイント別仕様へジャンプできます。
>
> 「業務ルール」はポリシー（何を満たすか）、「処理の流れ」は順序（どう進むか）を、実装そのものにならない粒度で書く。エンドポイント別仕様の見出し構成は揃え、該当する業務ルールが無い場合は本文に「なし」と明記する。処理の流れには最低限「何を取得／更新して何を返すか」を記載する。状態遷移・副作用・冪等性・前提・バリデーション補足などは独立セクションにせず、業務ルール／処理の流れ／前後の文章のいずれかで簡潔に表現する。

## 概要

このAPI設計書（ドメインや業務単位）が実現する業務目的を1-3段落で記載する。

- 対象ユーザーストーリー: `US-00N`
- 対象範囲外がある場合: 例: グループ編成は対象外

## エンドポイント一覧

| Method | Path                          | operationId                           | 概要                    |
| ------ | ----------------------------- | ------------------------------------- | ----------------------- |
| `POST` | `/internal/events/some-event` | [`postSomeEvent`](#postSomeEvent)     | エンドポイントの目的1行 |
| `GET`  | `/internal/resources/{id}`    | [`getSomeResource`](#getSomeResource) | エンドポイントの目的1行 |

## エンドポイント別仕様

### postSomeEvent {#postSomeEvent}

| 項目          | 値                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| Method / Path | <InternalLink path="/api/app/operations/postSomeEvent">POST /internal/events/some-event</InternalLink> |
| operationId   | <InternalLink path="/api/app/operations/postSomeEvent">postSomeEvent</InternalLink>                    |
| 概要          | このエンドポイントの業務目的を1-3行で記載する。                                                        |

#### 認証・不正呼び出し防止

- 認証方式
- 署名検証 / トークン検証 / 内部NW制限 / mTLS など
- 必要に応じて Security Baseline への準拠方針

#### リクエスト

| フィールド  | 型     | 必須        | 説明             |
| ----------- | ------ | ----------- | ---------------- |
| `fieldName` | `type` | はい/いいえ | 意味・制約・補足 |

#### 業務ルール

1. ルール1
2. ルール2
3. 冪等性 / 締切 / 上限 / 整合性など

#### 処理の流れ

1. 受信イベントを `eventId` で重複チェックし、処理済みなら何もせず `no_change` を返す。
2. 締切や月次上限などの前提を判定し、超過時は `rejected` を返す（参加状態は更新しない）。
3. 業務ルールに従って参加状態を更新（または取消）し、冪等性を維持する。
4. 結果（`accepted` / `no_change` / `rejected`）と現在の参加状態を返す。

> 複雑な場合は Mermaid `sequenceDiagram` 等を併記してもよい（任意）。

#### レスポンス（例）

`200` - 成功時の説明

```json
{
  "status": "ok"
}
```

別ケースが必要な場合の補足

```json
{
  "status": "ok",
  "result": "no_change"
}
```

#### エラー

| HTTP          | コード                                                                                                                                                | 条件                 |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `400`         | <InternalLink path="api/messages.html#E-API-001">E-API-001</InternalLink>                                                                             | バリデーションエラー |
| `401` / `403` | <InternalLink path="api/messages.html#E-API-002">E-API-002</InternalLink> / <InternalLink path="api/messages.html#E-API-003">E-API-003</InternalLink> | 認証・認可エラー     |
| `409`         | <InternalLink path="api/messages.html#E-API-004">E-API-004</InternalLink>                                                                             | 競合 / 重複          |
| `500`         | <InternalLink path="api/messages.html#F-API-001">F-API-001</InternalLink>                                                                             | 内部エラー           |

---

### getSomeResource {#getSomeResource}

| 項目          | 値                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| Method / Path | <InternalLink path="/api/app/operations/getSomeResource">GET /internal/resources/{id}</InternalLink> |
| operationId   | <InternalLink path="/api/app/operations/getSomeResource">getSomeResource</InternalLink>              |
| 概要          | このエンドポイントの業務目的を1-3行で記載する。                                                      |

#### 認証・不正呼び出し防止

- 認証方式
- 必要に応じて Security Baseline への準拠方針

#### リクエスト

| 区分    | 名前        | 型     | 必須        | 説明             |
| ------- | ----------- | ------ | ----------- | ---------------- |
| `path`  | `id`        | `type` | はい        | 意味・制約・補足 |
| `query` | `paramName` | `type` | はい/いいえ | 意味・制約・補足 |

#### 業務ルール

なし。

#### 処理の流れ

1. パスパラメータ `id` で対象リソースを取得し、存在しなければ `404` を返す。
2. 必要な属性のみを抽出してレスポンス本体を構築し、`200` で返す。

#### レスポンス（例）

`200` - 成功時の説明

```json
{
  "status": "ok"
}
```

#### エラー

| HTTP  | コード                                                                    | 条件                 |
| ----- | ------------------------------------------------------------------------- | -------------------- |
| `400` | <InternalLink path="api/messages.html#E-API-001">E-API-001</InternalLink> | バリデーションエラー |
| `404` | <InternalLink path="api/messages.html#E-API-001">E-API-001</InternalLink> | 対象リソース未存在   |
| `500` | <InternalLink path="api/messages.html#F-API-001">F-API-001</InternalLink> | 内部エラー           |

---

## 関連

- ユーザーストーリー: <InternalLink path="user-stories/us-00N.html">US-00N</InternalLink>
- 関連API: <InternalLink path="api/design/api-design-file.html">既存API設計名</InternalLink>
- 関連DB: <InternalLink path="database/pdm/table/table-name.html">テーブル名</InternalLink>
