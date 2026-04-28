# Workflow Planning

## 1. Purpose

`docs/specs/docs/ja/1.0.0` を対象に、要件/ユーザーストーリーから実装準備可能な設計・生成フェーズへ移行するための作業順と成果物を定義する。

## 2. Inputs (Confirmed Artifacts)

- `aidlc-docs/inception/requirements/requirements.md`
- `aidlc-docs/inception/user-stories/personas.md`
- `aidlc-docs/inception/user-stories/stories.md`
- `luncher-system-design-draft.md`

## 3. Scope and Boundary for Next Work

- 対象範囲は「コラボランチ申請用のSlackメッセージの配信」「Slackメッセージへのリアクションによる参加表明」「コラボランチのマッチング」「割り当て済メンバーの欠席、他メンバーの参加」「写真リプライによる経費精算システムへの申請補助」「要件変更用の管理画面」まで。
- 経費の **申請** はこのプロダクトでは実装しない（別システムや手運用）。詳細は `requirements.md` §4。
- 要件変更（例: 月2回上限）はシステム管理者の設定責務として扱う。

## 4. Execution Sequence

### Step 1: Application Design Planning

- 目的: 仕様情報の構造（API/画面/用語/制約）を設計単位へ落とし込む。
- 作業:
  - 設計成果物の目次案を作成（画面、API補足、制約ルール、運用ルール、管理画面仕様）。
  - 画面仕様は `requirements.md` FR-03 および既存の `ja/1.0.0/screen/design/*.md`（例: `login.md`）の体裁で統一する。
  - `docs/specs/docs/ja/1.0.0/user-stories/` の **`us-001.md`〜`us-007.md`** を設計テーマへ再マッピング（正本はファイル名準拠）。
- 完了条件:
  - 設計成果物一覧と相互参照ルールが定義済み。

### Step 2: Units Generation Planning

- 目的: 後続の Construction で実装単位に分解できる最小単位を定義する。
- 作業:
  - ストーリーごとに実装単位（API、画面、バッチ、設定管理、管理画面）を候補化。
  - 優先順位（MVP順）と依存関係を明示。
- 完了条件:
  - 全ストーリーが少なくとも1つの実装単位へ対応付け済み。

### Step 3: Quality Gate Definition

- 目的: 設計/生成フェーズに進む前のレビュー条件を統一する。
- 作業:
  - レビュー観点（整合性、用語統一、リンク妥当性、制約反映）を明文化。
  - Security Baseline / Property-Based Testing の適用確認ポイントを定義。
- 完了条件:
  - チェックリストが定義され、フェーズ移行基準が明記済み。

## 5. Deliverables

1. Workflow Planning 計画書（本ファイル）
2. Application Design フェーズの成果物目次案 → [`application-design-deliverables.md`](./application-design-deliverables.md)
3. Units Generation の候補一覧（優先度・依存関係付き） → [`units-generation-candidates.md`](./units-generation-candidates.md)
4. 設計移行前チェックリスト → [`design-transition-checklist.md`](./design-transition-checklist.md)

### Step 完了メモ

| Step                               | 状態 | 参照                                        |
| ---------------------------------- | ---- | ------------------------------------------- |
| Step 1 Application Design Planning | 完了 | `application-design-deliverables.md` §3〜§6 |
| Step 2 Units Generation Planning   | 完了 | `units-generation-candidates.md`（候補表・MVP 順・依存） |
| Step 3 Quality Gate Definition     | 完了 | `design-transition-checklist.md` 全文       |

## 6. Risks and Mitigation

- リスク: ストーリーの粒度差により、実装単位分解が過大/過小になる。
  - 対応: INVEST で `△` 判定のストーリー（US-002, US-004, US-006）を優先再分割する。
- リスク: 申請補助の範囲が拡張され、対象外の経費「申請」機能が混入する。
  - 対応: 対象外条件（経費の申請をこのプロダクトで担わない）を各成果物の冒頭に再掲する。

## 7. Exit Criteria

- `aidlc-state.md` の `Current Stage` を `Application Design` へ更新できる状態であること。
- 上記 Deliverables がレビュー可能な形で `aidlc-docs` 配下に揃っていること。
