# セキュリティ

境界・シークレット・Entra ID／OAuth の設計方針をまとめる。出典は主に `infra/blueprint.md` の「アイデンティティ／アクセス」「認証・認可」「リソース構築・運用上の原則」。

## セキュリティとネットワーク境界（要約）

- PostgreSQL は**パブリック公開しない**。**Private Endpoint と Private DNS** で閉域化。
- **通信の TLS**: PostgreSQL・Storage・Key Vault・ACR への接続は各サービスが要求する TLS を満たす。Web → API は internal ingress 上の HTTPS。
- **保存時暗号化**: PostgreSQL・Storage・Key Vault は **CMK は用いず**、**プラットフォーム管理キー**のみ。
- **Key Vault**: **ソフトデリート**と**パージ保護**を有効化。**SKU は Standard**。
- **NSG**: サブネット単位で**デフォルト Deny をベース**に必要な通信のみ明示。
- **Private Endpoint**: 接続承認は **Auto-approve**。
- **DDoS / WAF**: インターネット公開エッジを使わないため **現時点では不要**。経路変更時は再評価。
- **Microsoft Defender for Cloud**: **Foundational CSPM（無料）**のみ。**有料の Defender CSPM（Billable）は採用しない**。
- **ワークロード保護**: **Defender for Storage**、**Defender for PostgreSQL**、**Defender for Containers** を本番・開発・ステージングの対象に適用。
- **Private Endpoint を持つ PaaS** は **`publicNetworkAccess = Disabled`** を明示（PE だけでは公開経路は自動で閉じない）。
- 利用者アクセスは **Twingate 経由**（[ネットワーク](./network.md)）。Front Door は利用しない。

## シークレット・鍵・証明書

- 機密は **Key Vault** に置き、アプリは **Managed Identity** で参照。Terraform 変数に平文で流し込まない。
- Container Apps には**ユーザー割り当て Managed Identity**（アプリ／Job ごとに１つ）。システム割り当ては使わない（再デプロイでプリンシパルが変わらないようにする）。
- **`terraform output` にパスワード付き接続文字列を出さない**。
- **ローテーション目安**: 外部 API キー 90〜180 日、証明書は期限 30 日前から更新アラート。DB 管理者パスワードは緊急フォールバック用に Key Vault に保管し年１回ローテーション（通常運用では未使用）。

## アイデンティティ（Entra ID）

| リソース               | 区分             | 役割                                                                                                                                           |
| ---------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Microsoft Entra ID** | **利用者**       | 本アプリ専用に**新規テナント**（リソーステナント）。**メンバー**は直接登録。**ゲスト**は B2B で招待。                                          |
| **Microsoft Entra ID** | **アプリ・連携** | App registration を用途ごとに分ける：**Web**（SPA＋PKCE）、**API**、**Airflow Web UI**（Web＋リダイレクト URI）。GitHub Actions 連携（OIDC）。 |
| **Twingate**           | —                | 社内向けリモートアクセス（Connector は Azure 側で構築）。                                                                                      |

**補足**

- 条件付きアクセスはホームテナントとリソーステナントの**両方**が順に適用され得る（OAuth の `aud` / `roles` 検証とは別レイヤー）。
- **リソーステナント**では **外部 MFA 信頼**と、**本アプリのクラウドアプリに MFA を要求する** CA を**セットで採用**する方針（[Microsoft ドキュメント](https://learn.microsoft.com/ja-jp/entra/external-id/cross-tenant-access-settings-b2b-collaboration)）。
- Terraform は `azuread` でアプリ登録・グループ・**条件付きアクセス**までコード化する。**テナント作成・ブートストラップ**は [環境・Terraform](./environment.md) の対象外。

## 認証・認可の設計方針（OAuth 2.0 / OIDC）

- **認証**: Web は Authorization Code Flow（PKCE）でサインイン。ID トークンは UI セッション確立用。
- **認可**: API は API 用 Entra アプリをリソースとし、アクセストークンの **`aud` / `roles`** を検証する。
- **権限モデル**: アプリ内の認可は **Entra アプリロール**で制御。セキュリティグループは**サインイン可否**に使い、アプリ内の権限分離には使わない。
- **Web を追加する場合**は **Web ごとに App registration が必要**（Airflow も専用）。

### 適用するフロー

| フロー                    | 用途                   | 使いどころ                                            |
| ------------------------- | ---------------------- | ----------------------------------------------------- |
| Authorization Code + PKCE | 対話ログイン           | ブラウザ → Web                                        |
| On-Behalf-Of（OBO）       | ユーザートークンの委任 | Web/API が下流を「ユーザー代理」で呼ぶ場合            |
| Client Credentials        | 非対話                 | バッチ・バックエンドがユーザー非依存で API を呼ぶ場合 |

### トークン検証の最低要件（API）

- JWKS による**署名検証**（未検証トークンは拒否）。
- `iss` / `tid`、`aud`、有効期限、`roles` による認可（`scp` は委任トークン確認用）。
- 必要に応じて `azp` / `appid` で許可クライアントのみ。

## アクセス制御（RBAC）・CI/CD 認証

- **GitHub Actions → Azure** は **OIDC のみ**（クライアントシークレットは使わない）。
- **`dev` / `stg` / `prod` 各スタック**ごとに **`entapp-mss-{env}-gha-oidc` を１つ**、RBAC は当該環境の RG に限定。
- **`infra/environments/shared`** は **`entapp-mss-shared-gha-oidc` を１つ**、環境横断リソース（state、privatelink DNS、共有 Log Analytics 等）に必要なスコープに限定。
- フェデレーションの **subject 条件は `repo:<org>/<repo>:environment:<name>` で厳密化**。**GitHub Environment に保護ルール**（承認者・待機タイマー等）を設定する。
- 運用者は Reader + Monitor を中心とし、書き込みは **PIM** で時間制限付き昇格。
- PostgreSQL は **Entra ID 認証必須**、パスワード認証は無効化。人的アクセスはグループ分離・PIM（ブループリント「アクセス制御」参照）。
- アプリ用ユーザー割り当て MI は **必要最小限のロールのみ**。

## 関連ページ

- [ネットワーク](./network.md)
- [データベース](./database.md)
- [クライアント事前調整](./client-alignment.md)
- [環境・Terraform](./environment.md)
