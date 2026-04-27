---
name: screen-design-spec-writer
description: Standardizes screen design documents under docs/specs/docs/ja/{version}/screen/design using the project's agreed template, table columns, event/action notation, internal link style, and route-based filename conventions. Use when creating or editing screen design specs where the filename is the Next.js route name with .md.
---

# Screen Design Spec Writer

## Purpose

`screen/design` の画面設計書を、プロジェクト合意済みフォーマットで統一して作成・修正する。

## Use When

- `docs/specs/docs/ja/{version}/screen/design/*.md` を新規作成するとき
- 既存の画面設計書の列構成、記法、文体を整えるとき
- API/メッセージリンクをロケール・バージョン追従の内部リンクに統一するとき

## Required Structure

画面設計書は、以下の順で記載する。

- ファイル名は Next.js の Route 名 + `.md` とする（例: `/login` -> `login.md`）。

1. Frontmatter (`id`, `title`, `url`, `auth`)
2. `# {Next.js Route}: 画面名`（例: ログイン画面）
3. `## レイアウト` — **Markdown 画像**（`![alt](相対パス)`）で示す。**画像は 1 枚以上必須**（複数可）。**ファイル名を `.md` と揃える必要はない**（拡張子は PNG 等、運用に合わせる）。
4. `BasicInfo` ブロック
5. `## 項目一覧`
6. `## イベント`

## ID Rules

1. 変更した時に重複がないかチェック。
2. 追加する時、どこに追加するか。既に振られている番号をふる場合、新規追加したファイル以外の番号の振り直しをすること。

補足:

- `id` は数値で管理し、`screen/design` 配下で一意にする。
- `id` を変更したら、並び順（index とサイドバー）への影響を確認する。

## 項目一覧 Rules

`項目一覧` の列は以下で固定。

- `No`
- `項目名`
- `タイプ`
- `I/O種別`
- `値`
- `書式`
- `入力制限`
- `必須`
- `説明`

記載ルール:

- `必須` は必須時のみ `✓`
- `入力制限` は文字数だけでなく文字種も書く（例: `半角英数字・記号、8〜128文字`）
- `説明` は必要なときのみ記載。不要なら空欄可

## イベント Rules

`イベント` の列は以下で固定。

- `No`
- `項目`
- `イベント`
- `アクション`

記載ルール:

- `No` はイベント番号のみ（連番）
- `項目` は「項目一覧の番号 + 項目名」
  - 画面全体イベントは `画面`
  - 例: `3 ログイン`
- `アクション` は手順番号付き
  - 表記は `1.` 形式
  - 手順ごとに改行（テーブル内では `<br>` を使用）
- 文体は体言止め
- API呼び出し、画面遷移、エラーコード参照は `アクション` に書く

## Internal Link Rules

ロケール・バージョン依存リンクは `InternalLink` を使う。

```md
<InternalLink path="api/app/operations/getHealth.html">ヘルスチェックAPI</InternalLink>
<InternalLink path="screen/messages.html#E001">E001</InternalLink>
```

禁止:

- `http://localhost:...` の絶対URL直書き

## Error Code Rules

- エラーコードは `screen/messages.html` の該当アンカーへリンクする

## Layout (レイアウト)

- 画面の見た目の根拠は **画像**（通常は `screen/design` と同じ階層の相対パスで参照）。**1 枚以上必須**（複数枚可）。
- **画像ファイル名を `.md` ファイル名と同じにする必要はない**（例: `login.png` だけに限らない）。
- 要件定義（`requirements.md` FR-03）の画面可視化は、本リポジトリの ja では **画像埋め込み**で満たす。

## Editing Checklist

- [ ] セクション順が揃っている
- [ ] `## レイアウト` に **Markdown 画像**（`![...](...)`）が **1 枚以上ある**（2 枚目以降・参照先のファイル名は画面ごとに任意）
- [ ] `id` の重複がない
- [ ] 途中挿入時に既存ファイルの `id` を必要に応じて振り直している
- [ ] `項目一覧` の列が固定順で揃っている
- [ ] `イベント` の列が固定順で揃っている
- [ ] `No`/`項目` の規約（`3 ログイン` 形式）に従っている
- [ ] `アクション` が `1.` + `<br>` + 体言止めになっている
- [ ] API/メッセージ参照が `InternalLink` で書かれている
