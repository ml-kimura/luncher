---
name: user-story-writing
description: ユーザーストーリーMarkdownをこのリポジトリ規約で作成する。Use when creating or updating files under docs/specs/docs/*/*/user-stories/us-*.md, or when the user asks to write user stories/frontmatter/acceptance criteria.
---

# User Story Writing

このスキルは、`docs/specs/docs/[locale]/[version]/user-stories/us-*.md` の作成・更新を最短で正確に行うための手順です。

## Quick Start

1. 対象の `us-xxx.md` を開く
2. 空ファイルまたは新規作成時は Markdown 上で `usdoc` スニペットを展開する
3. Frontmatter を埋める
4. 必要な本文セクションを維持する（右サイドナビ用）
5. `trigger` / `postConditions` / `acceptanceCriteria` を具体化する

## Required Structure

ページタイトル（H1）は手書きせず、`UserStoryTitle` で表示する。`id` と `title` がともにある場合は **`US-00X {title}`** 形式（例: `US-007 システム管理者が要件設定を変更できる`）。`id` のみ／`title` のみでも可能。

```md
<UserStoryTitle />
```

右側サイドナビを表示するため、本文に次の見出しを残す。

- `## 基本情報`
- `## 関連成果物`
- `## ストーリー`
- 必要に応じて `## 処理条件` `## 受け入れ条件` `## 対象外` `## 補足`

各見出し配下は `UserStoryPage` を使う。

```md
## 基本情報
<UserStoryPage section="basic-info" />
```

## Frontmatter Rules

### outputs（関連成果物マトリクス・ユーザーストーリー一覧と対応）

`outputs` は配列で、値ごとに次の列／リンク先に◯が付く。

| 値 | 意味 | リンク先（目安） |
| --- | --- | --- |
| `screen` | 画面フロー | `screen/flow/` |
| `batch` | バッチフロー | `batch/flow/` |
| `api` | API設計書 | `api/design/` |
| `db` | **テーブル定義書**（他列とは別。PDM のテーブル一覧） | `database/pdm/table/` |

- `db` で「テーブル定義書」に◯を付けたいときは **`db` のみ**を書く（`table-def` などの別キーは使わない）
- 複数該当するときは `outputs` に複数行で列挙する

例:

```yaml
outputs:
  - batch
  - api
  - db
```
- `id` は数値で管理し、同一 `user-stories` ディレクトリ内で一意にする
- 変更時は `id` 重複がないか確認する
- 途中挿入で既存の並びと整合しない場合は、必要に応じて他ファイルの `id` も振り直す
- `story.who` / `story.want` / `story.why` は空にしない
- `trigger` は起動契機を1文で書く（例: 定時バッチ、Slack操作）
- `postConditions` は「処理後に保証される状態」を箇条書き
- `acceptanceCriteria` は検証可能な文にする（成功条件、重複防止、エラー時挙動）
- `outOfScope` は「このUSでやらないこと」を明記

## Writing Heuristics

- 曖昧語を避ける（「適切に」「いい感じに」など）
- 1つの条件に1つの結果を書く
- 実装手段ではなく利用者価値を優先する
- 同一ファイル内で用語を統一する（参加表明/応募 などを混在させない）

## Snippet Usage

このプロジェクトには `.vscode/user-stories.code-snippets` があり、次を利用できる。

- Prefix: `usdoc`
- 用途: ユーザーストーリーの Frontmatter + `<UserStoryTitle />` + 本文見出し + `UserStoryPage` 呼び出しを一括展開
- 展開後の Tab で `id` → `title` → 他フィールドへ移動できる
- `outputs` の1行目は補完から `screen` / `batch` / `api` / `db` を選ぶ。**追加の成果物タイプが必要なら**、YAML の `outputs:` 配下に `- screen` のように行を追記する

新規作成時は、まず `usdoc` を展開してから内容を埋める。Markdown の言語モードでスニペットが有効になること。

## Editing Checklist

- [ ] `id` の重複がない
- [ ] 途中挿入時に必要な `id` 振り直しを実施した
- [ ] H1を手書きせず、`<UserStoryTitle />` を使用している（表示は `US-00X` + タイトル形式）
- [ ] `outputs` がストーリーおよび `postConditions` と整合している
- [ ] `story.who` / `story.want` / `story.why` が空でない
- [ ] 右サイドナビ用の見出し（`##`）が残っている
- [ ] 各見出し配下の `UserStoryPage section` が対応している
- [ ] `trigger` / `postConditions` / `acceptanceCriteria` が検証可能な文になっている
