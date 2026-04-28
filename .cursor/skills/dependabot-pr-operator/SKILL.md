---
name: dependabot-pr-operator
description: Dependabot PRのマージ判断、関連PRの統合更新、クローズ連携を行う。Use when the user asks to merge/edit Dependabot PRs, reconcile related dependency PRs, or coordinate consolidated updates across multiple Dependabot PRs.
---

# Dependabot PR Operator

## Purpose

Dependabot が作成した PR を、単体マージか統合マージかを判定して運用する。

## ユーザー指定要件（原文）

1. 内容が１パッケージで完結している場合、そのままマージ
2. 関連パッケージを同期して更新が必要な場合、他のPRをチェックして、１つのPRに修正を統合し、通知。
3. 統合した場合、承認があれば、マージし、他のPRは別PRで対処したことをコメントして Close

## Trigger

- 「dependabot の PR をマージしたい」
- 「dependabot PR を整理したい」
- 「関連する依存更新を1つにまとめたい」
- 複数の Dependabot PR が同時に open で、相互に依存している

## Workflow

以下を上から順番に実行する。

1. 対象 PR と関連 PR を列挙する
   - open の Dependabot PR 一覧を取得する
   - 変更ファイル（特に `package.json`, `pnpm-lock.yaml`, workspace/catalog 周辺）を確認する
2. worktree を使って並列調査する
   - PRごとに独立 worktree を作成する
   - 競合や依存関係の確認、CI再現、必要な修正案の検証を各 worktree で並列実施する
   - 親作業側で結果を集約し、単体マージ可能か統合が必要かを判定する
3. 単体マージ可能か判定する
   - 変更が1パッケージで閉じている
   - 依存のセット更新（例: React と react-dom、Storybook 一式）が崩れていない
   - CI が通る、または通過見込みが高い
4. 単体で閉じる場合
   - その PR をそのまま進める（必要な更新だけ実施）
   - ユーザー承認がある場合のみマージする
5. 統合が必要な場合
   - 基準となる1つの PR（統合先）を必ず決める（未決定のまま実装を進めない）
   - 統合先 PR に、統合対象 PR 一覧（番号・URL・対象ブランチ）を先にコメントする
   - 上記コメント後にのみ、他 PR の必要変更を worktree 上で統合先ブランチへ反映する
   - 反映後、統合先 PR に「反映完了」と「統合元PRのクローズ予定」を追記する
6. 統合後の最終処理
   - マージ対象PR（統合先）とクローズ対象PR（統合元）を明示した一覧を提示する
   - 上記一覧に対してユーザーの明示承認を得る（承認前はマージ・クローズ禁止）
   - ユーザー承認後、統合先 PR を自動でマージする
   - 統合元の他 PR には、統合先 PR URL と対処内容をコメントして自動で close する

## Operational Rules

- マージ操作は必ずユーザーの明示承認後に行う
- force push や履歴改変を伴う操作は事前に明示し、承認なしで実行しない
- コメントには必ず統合先 PR URL を含める
- close する PR には「なぜ close するか」を1行で明確に残す
- 並列作業時は、各 PR の作業を必ず別 worktree に分離し、同一作業ディレクトリで複数 PR を混在させない
- 最終反映前に、どの worktree の変更を採用したかをユーザーへ明示する
- 統合先 PR が確定するまで、新規統合ブランチや新規統合PRを作成しない
- 統合先 PR への「統合対象一覧コメント」を完了するまで、コード反映を開始しない
- 最終承認の提示時は、`mergeするPR` と `closeするPR` を必ず分けて記載する

## Output Format

ユーザーへの報告は以下の順で簡潔に出す。

1. 判定結果（単体マージ / 統合必要）
2. 対象 PR 一覧（番号とURL）
3. 統合先 PR（番号・URL・ブランチ）と統合対象 PR 一覧
4. 実施内容（事前コメント・反映内容・追記コメント）
5. 承認待ちアクション（merge対象PR / close対象PR の可否）
