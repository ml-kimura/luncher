# User Stories

ストーリー主軸は **User Journey-Based**。  
レビュー単位は **Epic単位**。

---

## Epic 1: 参加エントリー（Entry）

### US-001: Slackから参加表明できる
**As a** 当日参加者  
**I want** Slack上で参加/不参加を即時登録したい  
**So that** ランチ参加意向を手間なく伝えられる

- **関連API（候補）**: `postEntry`  
  - **Request要点**: `lunchDate`, `slackUserId`, `attendanceStatus`  
  - **Response要点**: 登録結果、現在の参加者数

**Acceptance Criteria（箇条書き）**
- 正常系: 参加ボタン押下で当日の参加状態が保存される
- 異常系: 対象日が締切後の場合は登録できず理由を表示
- 異常系: 当月のコラボランチ申請回数が2回に達している場合は申請できず、上限超過理由を表示
- 権限系: 認証済みユーザーのみ登録可能

**Acceptance Criteria（Given/When/Then）**
- Given 有効な対象日で認証済みユーザーである  
  When Slack上で「参加」操作を実行する  
  Then 参加状態が保存され、確認メッセージが返る

- Given 締切済み対象日である  
  When 「参加」操作を実行する  
  Then 登録は拒否され、締切理由が表示される

- Given 当月の当該ユーザー申請回数が2回である  
  When 新規申請操作を実行する  
  Then 登録は拒否され、「1名あたり月2回まで」の理由が表示される

---

## Epic 2: マッチングと通知（Matching & Notification）

### US-002: 制約付きでグループを自動編成できる
**As a** 当日参加者  
**I want** 必須制約（4名以上、同一部署重複回避）を満たしたグループへ自動で割り当てられたい  
**So that** 調整役がいなくてもコラボランチを成立できる

- **関連API（候補）**: `runMatching`  
  - **Request要点**: `lunchDate`, `matchingConfigVersion`  
  - **Response要点**: 生成グループ、未割当ユーザー、警告

**Acceptance Criteria（箇条書き）**
- 正常系: 必須制約を満たすグループが作成される
- 異常系: 参加者不足時は未成立として理由が返る
- 権限系: システムのスケジュール実行でのみ起動され、一般ユーザーは任意実行できない

**Acceptance Criteria（Given/When/Then）**
- Given 参加者データと有効な設定が存在する  
  When マッチング処理を実行する  
  Then 制約を満たすグループ結果が返却される

- Given 参加者が最低人数未満である  
  When マッチング処理を実行する  
  Then 未成立結果と不足理由が返却される

### US-003: マッチング結果を通知できる
**As a** 当日参加者  
**I want** マッチング確定情報をSlackで受け取りたい  
**So that** 次の行動（集合・申請準備）にすぐ移れる

- **関連API（候補）**: `notifyMatchResult`  
  - **Request要点**: `lunchId`, `groupMembers`, `recommendedRestaurants`  
  - **Response要点**: 通知成功/失敗、再送情報

**Acceptance Criteria（箇条書き）**
- 正常系: 対象参加者に通知される
- 異常系: 通知失敗時に再送手段が提示される
- 権限系: 通知はシステムが自動配信し、特定ユーザー権限に依存しない

---

## Epic 3: 店舗提案と確定（Restaurant Decision）

### US-004: Standard/Discoveryの店舗候補を比較できる
**As a** 当日参加者  
**I want** 社内定番候補と新規開拓候補を比較したい  
**So that** 会話しやすく条件に合う店舗を選べる

> 注記: 店舗提案はあくまで提案機能であり、コラボランチのマッチング成立条件には影響しない。

- **関連API（候補）**: `getRestaurantSuggestions`  
  - **Request要点**: `lunchId`, `groupProfile`, `mode`(standard/discovery)  
  - **Response要点**: 候補一覧、適合理由、混雑/席情報

**Acceptance Criteria（箇条書き）**
- 正常系: 2種の候補群（Standard/Discovery）が表示される
- 異常系: 候補が不足する場合は代替条件を提示
- 権限系: 当該ランチ参加者のみ候補閲覧可能

**Acceptance Criteria（Given/When/Then）**
- Given 対象ランチに参加している  
  When 候補画面を開く  
  Then StandardとDiscovery両方の候補が比較可能な形で表示される

---

## Epic 4: 精算補助（Receipt & SaaS Assist）

### US-005: レシートOCR結果を確認・補正できる
**As a** ランチ申請者（支払実行者）  
**I want** OCR抽出結果を確認して必要箇所を修正したい  
**So that** 精算データの正確性を担保できる

- **関連API（候補）**: `uploadReceipt`, `analyzeReceipt`  
  - **Request要点**: レシート画像、`lunchId`  
  - **Response要点**: 抽出項目（日時・金額・店舗）、信頼度

**Acceptance Criteria（箇条書き）**
- 正常系: OCR結果が表示され編集保存できる
- 異常系: OCR失敗時は手入力にフォールバック
- 権限系: ランチ時に支払を行った申請者のみ編集可能

### US-006: 補助上限を自動判定してSaaS入力補助できる
**As a** ランチ申請者（支払実行者）  
**I want** 適用ルールに基づいた補助判定と入力補助を受けたい  
**So that** 精算ミスと差戻しを減らせる

- **関連API（候補）**: `validateSubsidyRule`, `assistExpenseEntry`  
  - **Request要点**: `lunchId`, `totalAmount`, `participants`, `ruleVersion`  
  - **Response要点**: 補助対象額、超過理由、入力補助データ

**Acceptance Criteria（箇条書き）**
- 正常系: 有効日の設定に従った上限判定が行われる
- 異常系: 超過時は理由と修正案を表示
- 異常系: 申請者が当月2回を超える申請を行う場合は、月次上限制約違反として処理を停止
- 権限系: ランチ時に支払を行った申請者のみSaaS連携操作可能

---

## Epic 5: フィードバックと運用設定（Feedback & Governance）

### US-007: コラボランチ適性のレビューを投稿できる
**As a** 当日参加者  
**I want** 店舗の会話しやすさ等を投稿したい  
**So that** 次回候補の精度を上げられる

- **関連API（候補）**: `postLunchReview`  
  - **Request要点**: `lunchId`, `reviewScores`, `comment`  
  - **Response要点**: 投稿結果、反映先

**Acceptance Criteria（箇条書き）**
- 正常系: レビューが保存され候補算出に利用される
- 異常系: 必須項目欠落時は投稿拒否
- 権限系: 参加者本人のみ投稿可能

### US-008: 有効日付きで制度設定を更新できる
**As a** システム管理者  
**I want** 補助額・マッチング制約・申請制約（例: 月2回上限）を管理画面で管理したい  
**So that** 制度変更を安全に反映できる

- **関連API（候補）**: `upsertSystemConfig`, `listSystemConfigHistory`  
  - **Request要点**: `configKey`, `configValue`, `effectiveFrom`  
  - **Response要点**: 更新結果、競合情報、履歴
- **関連画面（候補）**: `SCR-ADM-001 制約設定管理画面`

**Acceptance Criteria（箇条書き）**
- 正常系: 有効日付きで設定履歴が登録される
- 正常系: 申請上限（例: 月2回）やマッチング制約値を変更できる
- 正常系: 管理画面で現在値・次回有効値・履歴を参照できる
- 異常系: 競合設定時は保存拒否し理由表示
- 権限系: システム管理者のみ更新可能

**Acceptance Criteria（Given/When/Then）**
- Given 管理者権限を持つユーザーである  
  When 有効日付き設定を保存する  
  Then 設定履歴が追加され、次回処理から反映対象となる

---

## Persona-Story Mapping

| Persona | 主担当ストーリー |
|---|---|
| 当日参加者 | US-001, US-004, US-007 |
| ランチ申請者（支払実行者） | US-005, US-006 |
| システム管理者 | US-008 |

## INVEST Self-Check

| Story | I | N | V | E | S | T | Notes |
|---|---|---|---|---|---|---|---|
| US-001 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Entry単機能として独立 |
| US-002 | ✓ | ✓ | ✓ | ✓ | △ | ✓ | マッチング条件増で分割余地あり |
| US-003 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 通知責務を限定 |
| US-004 | ✓ | ✓ | ✓ | ✓ | △ | ✓ | 候補提示ロジックは別ストーリー化可能 |
| US-005 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | OCR確認に責務限定 |
| US-006 | ✓ | ✓ | ✓ | ✓ | △ | ✓ | SaaS連携詳細で追加分割余地 |
| US-007 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 投稿機能として明確 |
| US-008 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 設定管理責務を明確化 |

注: △ のストーリーは実装計画時に必要に応じて分割して小さくする。
