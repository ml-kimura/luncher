# Story Generation Plan

Requirements をユーザー価値中心に再編して `stories.md` / `personas.md` を生成するための計画です。  
以下の質問に回答してください。全ての `[Answer]:` 記入後に生成へ進みます。

## Step 1: Story Organization Approach

- [x] ストーリー分解アプローチを確定する

### Question 1

`ja/1.0.0` のストーリー整理軸はどれを主軸にしますか？

A) User Journey-Based（利用フロー順）  
B) Feature-Based（機能カテゴリ順）  
C) Persona-Based（ユーザー種別順）  
D) Epic-Based（大項目→子ストーリー）  
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Step 2: Persona Scope Definition

- [x] ペルソナの範囲と粒度を確定する

### Question 2

初回で定義するペルソナ数はどれが適切ですか？

A) 2人（最小）  
B) 3人（標準）  
C) 4〜5人（詳細）  
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 3

優先するペルソナ観点はどれですか？

A) 業務ロール（企画/運用/管理者など）  
B) システム利用頻度（高頻度/低頻度）  
C) 権限レベル（一般/管理者/監査）  
D) 技術習熟度（初心者/中級/上級）  
X) Other (please describe after [Answer]: tag below)

[Answer]: X - 利用文脈（当日参加者 / ランチ申請者（支払実行者） / システム管理者）を優先軸とする

## Step 3: Story Granularity & Sizing

- [x] 1ストーリーの粒度を確定する

### Question 4

ストーリーの粒度はどれを希望しますか？

A) 小粒度（1ストーリー=1画面/1操作）  
B) 中粒度（1ストーリー=1業務シナリオ）  
C) 大粒度（1ストーリー=1機能群）  
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Step 4: Acceptance Criteria Style

- [x] 受け入れ条件フォーマットを確定する

### Question 5

受け入れ条件の形式はどれにしますか？

A) 箇条書き（Given/When/Then なし）  
B) Given/When/Then 形式  
C) 両方併用  
X) Other (please describe after [Answer]: tag below)

[Answer]: C

### Question 6

受け入れ条件に必ず含める観点はどれですか？

A) 正常系のみ  
B) 正常系 + 異常系  
C) 正常系 + 異常系 + 権限系  
D) 正常系 + 異常系 + 権限系 + 監査/ログ  
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Step 5: API/OpenAPI Alignment Rule

- [x] API仕様との対応づけルールを確定する

### Question 7

ストーリーとAPIの紐付けはどこまで記載しますか？

A) 関連API名のみ  
B) operationId まで明記  
C) operationId + リクエスト/レスポンス要点まで明記  
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Step 6: Mandatory Artifact Generation

- [x] `aidlc-docs/inception/user-stories/personas.md` を生成する
- [x] `aidlc-docs/inception/user-stories/stories.md` を生成する
- [x] 全ストーリーを INVEST 観点で自己検証する
- [x] 各ストーリーに受け入れ条件を付与する
- [x] ペルソナとストーリーの対応表を作成する

## Step 7: Completion/Approval Criteria

- [x] 生成完了判定を確定する

### Question 8

User Stories 完了時のレビュー単位はどれですか？

A) ペルソナ単位  
B) エピック単位  
C) ストーリー全体一括  
X) Other (please describe after [Answer]: tag below)

[Answer]: B
