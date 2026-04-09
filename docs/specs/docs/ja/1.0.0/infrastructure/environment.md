# 環境・Terraform

`infra` 配下の **Terraform** による環境分割・モジュール・対象外の整理。詳細は `infra/blueprint.md` の「Terraform リポジトリ構成」を参照する。

## Terraform の対象外（先決の手動／ブートストラップ）

以下は **適用順序またはプラットフォームの都合で Terraform より前**に存在させる必要があるもの、または **本リポジトリの provider でプロビジョニングしない**ものとする。初回だけ Terraform 外とし、**以降の Entra／Azure リソースは Terraform で管理**する方針と整合させる。

| 区分                                | 内容                                                                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Entra テナント**                  | **テナントの作成**は Terraform の対象外。契約・Entra 管理センター等で作成し、テナント ID を provider に渡す。                                                                                                                                                                          |
| **Azure サブスクリプション**        | **取得**およびテナントとの紐づけは Terraform 外。本リポジトリは **既存サブスクリプション上**に RG 以下を構築する。                                                                                                                                                                     |
| **Terraform 実行主体**              | `azurerm` / `azuread` を実行する **SP または OIDC 相当**の登録、**サブスクリプションへの RBAC**、**Entra でオブジェクトを作成・更新する権限**を **初回 apply より前**に用意する。GitHub Actions の OIDC は **循環依存**を避けるため Terraform 外または段階的 import が要ることがある。 |
| **Terraform state バックエンド**    | remote backend に **Azure Storage** を使う場合、**ストレージアカウント・コンテナ・ロック用テーブル**は参照 **時点で存在**している必要がある。初回のみ手動、または **ローカル state で `shared` 等を一度 apply してから backend 切替**等。                                              |
| **Twingate（SaaS）**                | **クラウド側**の初回は Terraform の外。Azure 上の Connector（ACI）は Terraform で構築。                                                                                                                                                                                                |
| **ライセンス・課金**                | Entra P1/P2、M365、Defender 等の **ライセンス付与**は通常 Terraform 外。                                                                                                                                                                                                               |
| **プロバイダー未対応の設定**        | 相当リソースがない、またはコード化しない **テナント／サブスクリプションレベル設定**は Terraform 外。                                                                                                                                                                                   |
| **Entra ID 緊急アクセスアカウント** | ロックアウト復旧のため **テナント作成直後に手作業で用意**（Microsoft 推奨）。                                                                                                                                                                                                          |

## 環境ディレクトリ

| パス                        | 内容                                                                                                                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `infra/environments/prod`   | 本番用 VNet、Subnets、Firewall、Private Endpoint、Storage（Blob/Queue）、Event Grid、Twingate Connector、Container Apps、DB 等                                                                                                                               |
| `infra/environments/stg`    | ステージング（同様のパターン）                                                                                                                                                                                                                               |
| `infra/environments/dev`    | 開発（同様のパターン）                                                                                                                                                                                                                                       |
| `infra/environments/shared` | **環境横断で１本にまとめる Azure リソース**（例: Terraform state 用 RG、**Private DNS Zone（`privatelink.*` 等）**、共有 Log Analytics、**`shared` スタック用 GitHub OIDC のエンタープライズアプリ**）。**Terraform がプロビジョニングするリソース**に限定。 |

**`dev` / `stg` / `prod` 各スタックにのみ置くものの例**: 利用者向け Private DNS（`app.mss.internal`/`{env}.app.mss.internal`）。**GitHub OIDC** は環境ごと **`entapp-mss-{env}-gha-oidc`** と \*\*`shared`用`entapp-mss-shared-gha-oidc`\*\*（[セキュリティ](./security.md) の RBAC・CI/CD 節、[リソース一覧](./resources.md)）。

環境間で CIDR・命名規則を揃え、将来の接続や運用を単純化する。

## モジュール（想定）

| モジュール                          | 役割                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `modules/network`                   | VNet、Subnets、NSG、Route Table、Firewall、Private Endpoint、DNS                                                          |
| `modules/entra`（想定）             | `azuread`: アプリ登録、エンタープライズアプリ、グループ、ロール、**条件付きアクセス**                                     |
| `modules/container-app-environment` | CAE（VNet 統合、ワークロードプロファイル）。**メイン**と **GitHub ランナー専用**で **別インスタンス**                     |
| `modules/container-app`             | Container App（Web / API / Batch）、Jobs（オーケストレーション／ランナー）、Managed Identity、シークレット                |
| `modules/database`                  | PostgreSQL（Entra ID 認証含む）、接続まわり                                                                               |
| `modules/storage-events`            | Storage Account（Blob/Queue）、Event Grid（`file-reception` 用と `snowpipe-notify` 用でサブスクリプション分割）、RBAC・PE |
| `modules/monitoring`                | Log Analytics（監査ログ転送含む）、Alerts、Logic Apps（Teams Webhook）、メール通知                                        |
| `modules/twingate-connector`        | 環境ごとの ACI ベース Twingate Connector                                                                                  |

`shared` と各環境で state を分離し、必要なら `terraform_remote_state` で参照する。backend（RG / Storage / container / key 命名）は統一し、**State Lock を必須**とする。

**Terraform / provider のバージョン**: ルートで**バージョン制約を固定**する。state 用 Storage Account は **RBAC を厳格化**し、**output に平文シークレットを出さない**。state 用 Storage には **Private Endpoint を必須**とする。

## 関連ページ

- [リソース一覧](./resources.md)
- [ネットワーク](./network.md)
- [セキュリティ](./security.md)
