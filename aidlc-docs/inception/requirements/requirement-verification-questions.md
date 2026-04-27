# Requirements Verification Questions

`docs/specs/docs/ja/1.0.0` の仕様書作成を進めるため、以下に回答をお願いします。  
各質問の `[Answer]:` に選択肢（A/B/C.../X）を記入してください。  
X を選んだ場合は、`[Answer]: X - ...` の形式で内容も追記してください。

## Question 1

今回まず最優先で整備したい仕様カテゴリはどれですか？

A) API仕様（エンドポイント、リクエスト/レスポンス、エラー）  
B) 画面仕様（画面遷移、UI要素、入力/表示ルール）  
C) バッチ仕様（処理フロー、スケジュール、入出力）  
D) データベース仕様（ERD、テーブル定義、制約）  
E) インフラ仕様（構成、監視、運用）  
X) Other (please describe after [Answer]: tag below)

[Answer]:
X: 機能要件

## Question 2

今回の仕様書の「ゴール定義」はどれが近いですか？

A) 開発者が実装を開始できる粒度まで明確化する  
B) ステークホルダー合意用の上位仕様を整備する  
C) 既存情報の整理・統合を優先する  
D) まずテンプレート化し、後から詳細を埋める  
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3

対象バージョンの扱いはどうしますか？

A) `ja/1.0.0` のみを今回確定する  
B) `ja/1.0.0` を確定し、将来版の雛形も作る  
C) バージョン横断で共通仕様を先に整備する  
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4

仕様記述の詳細レベルはどれを希望しますか？

A) 軽量（概要中心、詳細は最小限）  
B) 標準（実装に必要な項目を網羅）  
C) 詳細（例外ケースや制約まで厳密に記載）  
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5

API仕様の記載方針はどれにしますか？（APIを含む場合）

A) OpenAPI（既存 `openapi-app.yml`）を正とし、補足説明のみ追加  
B) OpenAPI + 画面/業務観点の補足を積極追加  
C) OpenAPI とは独立して文章仕様を主にする  
X) Other (please describe after [Answer]: tag below)

[Answer]:
X: hono の実行にデコレーターで記載し、pnpm api:generate-openapi で openapi-app.yml を生成。
実装で記載していく。

## Question 6

画面仕様で必須にしたい観点はどれですか？（画面を含む場合）

A) 画面項目定義（項目名、型、必須、制約）  
B) イベント定義（操作、発火条件、API連携）  
C) エラー/バリデーション表示  
D) 権限・ロール別表示制御  
E) 上記すべて  
X) Other (please describe after [Answer]: tag below)

[Answer]: E

## Question 7

用語・命名ルールの方針はどれですか？

A) 既存ドキュメントの命名を踏襲する  
B) 今回ルールを定義し、既存側を順次寄せる  
C) 日英併記ルールを明示する  
X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 8

受け入れ基準（Definition of Done）はどれが近いですか？

A) ページが存在し、主要項目が埋まっていれば完了  
B) サイドバー導線・リンク整合まで完了  
C) レビュー観点（漏れチェックリスト）を満たして完了  
D) 関連チーム承認まで完了  
X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 9

Security Baseline 拡張を有効化しますか？

A) Yes — enforce all SECURITY rules as blocking constraints  
B) No — skip all SECURITY rules  
X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 10

Property-Based Testing (PBT) 拡張を有効化しますか？

A) Yes — enforce all PBT rules as blocking constraints  
B) Partial — enforce PBT rules only for pure functions and serialization round-trips  
C) No — skip all PBT rules  
X) Other (please describe after [Answer]: tag below)

[Answer]: A
