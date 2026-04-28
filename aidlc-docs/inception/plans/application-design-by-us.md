# Application Design — US 別の進め方

[`application-design-deliverables.md`](./application-design-deliverables.md) §5 の相互参照に沿い、**`us-001`〜`us-007` を 1 本ずつ**設計を積み上げる作業表。

**正本（ストーリー）**: リポジトリ直下から  
`docs/specs/docs/ja/1.0.0/user-stories/us-00N.md`

## 1. 1 本あたりの手順

1. 下表の **outputs** に従い、`docs/specs/docs/ja/1.0.0` 配下の **画面 / `api/design` / `batch` / `database`** を新規追加または追記する。  
2. 当該 **`us-00N.md`** に、設計ファイル（と `operationId` 等）を**トレース**できる形で書き足す（`outputs` や「関連成果物」セクション、または当該ストーリーから見たリンク文）。  
3. API を触れたら `docs/specs/docs/public/openapi/openapi-app.yml`（生成）と **名称整合**。  
4. **当該 US の outputs をすべて満たしたら**、下表 **進捗** を `[x]` にする（または日付を記す）。

## 2. US 別チェック表

| ストーリー | outputs | 主に整備する成果物 | 目安 | 進捗 |
|------------|---------|--------------------|------|------|
| us-001 | batch, api, db | バッチ design・flow、API 補足、DB | 定時 10:00 案内、Slack 投稿、当日枠、重複案内の抑止、ログ | [ ]（DB テーブル作成のみ着手） |
| us-002 | api, db | API 補足、DB | リアクション→参加、締切・月次上限、重複抑止、解除 | [ ] |
| us-003 | batch, api, db | バッチ design・flow、API 補足、DB | 定時 11:55 マッチ、制約・通知、不成立スキップ | [ ] |
| us-004 | api, db, Slack | API 補足、DB、Slack 差分 | 割当後の欠席、除外・通知、再除外 | [ ] |
| us-005 | api, db, Slack | API 補足、DB、Slack 差分 | 未割当からの参加、定員・重複 | [ ] |
| us-006 | api, db | API 補足、DB | 写真リプライ、精算テキスト。申請本流は**対象外**（`requirements` §4） | [ ] |
| us-007 | screen, api, db | **画面**、API 補足、DB | 管理者の要件設定 UI、保存、次回マッチ以降への反映 | [ ] |

## 3. US ごとの作業一覧（実施チェック）

進捗の判定は、各 US のチェックがすべて `[x]` になっていることを基準にする。

### us-001（日次案内配信）
- [ ] バッチ設計（`batch/design`）を作成・更新
- [ ] バッチフロー（`batch/flow`）を作成・更新
- [ ] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] `us-001.md` に関連成果物トレースを追記
- [ ] 重複投稿抑止・ログ要件の反映を確認

### us-002（参加表明）
- [ ] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] 締切判定・月次上限（1名あたり月2回）を反映
- [ ] `us-002.md` に関連成果物トレースを追記

### us-003（マッチング）
- [ ] バッチ設計（`batch/design`）を作成・更新
- [ ] バッチフロー（`batch/flow`）を作成・更新
- [ ] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] 制約（4名以上、同一部署重複回避）と不成立時挙動を反映
- [ ] `us-003.md` に関連成果物トレースを追記

### us-004（割当後の欠席）
- [x] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] Slack 通知差分（通知文面/送信条件）を反映
- [ ] `us-004.md` に関連成果物トレースを追記

### us-005（後から参加）
- [ ] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] 定員・重複参加ルールを反映
- [ ] Slack 通知差分（必要時）を反映
- [ ] `us-005.md` に関連成果物トレースを追記

### us-006（精算テキスト化）
- [ ] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] 写真リプライ受信からテキスト化までの処理境界を明記
- [ ] 「申請本流は対象外」を明記
- [ ] `us-006.md` に関連成果物トレースを追記

### us-007（要件設定管理）
- [ ] 画面設計（`screen/design`）を作成・更新
- [ ] API 補足（`api/design`）を作成・更新
- [ ] OpenAPI（`public/openapi/openapi-app.yml`）と operationId を整合
- [ ] DB 設計（CDM/PDM）を作成・更新
- [ ] 有効日付き設定・履歴・反映タイミングを反映
- [ ] `us-007.md` に関連成果物トレースを追記

**メモ**

- 現行の `batch/design/bat-001` 等は**別ドメインの雛形**の可能性が高い。Lunch 用のバッチは **us-001 / us-003 向けの設計**として**置き換え or 併記**を検討。  
- **画面**が明示なのは **us-007** のみ（`login`/`home` は基盤・他 US と兼用しうる）。

## 4. 推奨する扱い順（依存の目安）

1. us-001（日次枠）  
2. us-002（参加表明）— us-001 と論理接続  
3. us-003（マッチング）— us-002 前提、**設定は us-007 またはコード**  
4. us-004 / us-005 — いずれも us-003 以降。順序は業務上どちらを先に深くするか  
5. us-006  
6. us-007（マッチを設定駆動にするなら us-003 より**前**に扱う選択も可）

`units-generation-candidates.md` §5〜6 と併せてよい。
