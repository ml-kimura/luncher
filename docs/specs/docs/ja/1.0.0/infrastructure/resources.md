# リソース一覧

Terraform やポータルで付与する**論理名の例**。実装時は Azure の[命名規則・一意性](https://learn.microsoft.com/azure/azure-resource-manager/management/resource-name-rules)に合わせて調整。

- `{env}` … `prod` / `stg` / `dev` に読み替え。
- **Storage Account・Key Vault・Container Registry** などは**グローバルで一意**のため、`{env}` でも衝突する場合はサフィックス（短いランダム文字列等）を足す。

## 環境別リソース

| 種別                                                    | リソース名の例                                                                                       |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Resource Group                                          | `rg-mss-{env}`                                                                                       |
| Virtual Network                                         | `vnet-mss-{env}`                                                                                     |
| Subnet（Container Apps）                                | `snet-mss-{env}-container-apps`                                                                      |
| Subnet（Twingate Connector）                            | `snet-mss-{env}-twingate-connector`                                                                  |
| Subnet（Private Endpoints）                             | `snet-mss-{env}-private-endpoints`                                                                   |
| Subnet（Azure Firewall）                                | `AzureFirewallSubnet` （名前固定）                                                                   |
| Azure Firewall                                          | `afw-mss-{env}`                                                                                      |
| Public IP（Firewall 用）                                | `pip-mss-{env}-firewall`                                                                             |
| NSG（Container Apps）                                   | `nsg-mss-{env}-container-apps`                                                                       |
| NSG（Twingate Connector）                               | `nsg-mss-{env}-twingate-connector`                                                                   |
| NSG（Private Endpoints）                                | `nsg-mss-{env}-private-endpoints`                                                                    |
| Route Table                                             | `rt-mss-{env}-default`                                                                               |
| Private Endpoint（Blob）                                | `pe-mss-{env}-blob`                                                                                  |
| Private Endpoint（PostgreSQL）                          | `pe-mss-{env}-postgresql`                                                                            |
| Private Endpoint（Key Vault）                           | `pe-mss-{env}-keyvault`                                                                              |
| Private Endpoint（Container Registry）                  | `pe-mss-{env}-acr`                                                                                   |
| Private Endpoint（Queue）                               | `pe-mss-{env}-queue`                                                                                 |
| Storage Account                                         | `mssapp{env}` （グローバル一意。衝突時はサフィックス追加）                                           |
| Blob コンテナ（Event Grid デッドレター）                | `eventgrid-deadletter`                                                                               |
| Blob コンテナ（受信）                                   | `inbound`                                                                                            |
| Blob コンテナ（処理中）                                 | `processing`                                                                                         |
| Blob コンテナ（処理済み）                               | `processed`                                                                                          |
| Blob コンテナ（送信）                                   | `outbound`                                                                                           |
| Queue Storage（ファイル受信）                           | `file-reception`                                                                                     |
| Queue Storage（Snowpipe 通知）                          | `snowpipe-notify`                                                                                    |
| Queue Storage（通知）                                   | `notification`                                                                                       |
| Queue Storage（ポイズン: ファイル受信）                 | `file-reception-poison`                                                                              |
| Queue Storage（ポイズン: Snowpipe 通知）                | `snowpipe-notify-poison`                                                                             |
| Queue Storage（ポイズン: 通知）                         | `notification-poison`                                                                                |
| Event Grid システムトピック                             | `egt-mss-{env}-storage`                                                                              |
| Event Grid サブスクリプション（Blob→`file-reception`）  | `evgs-mss-{env}-blob-to-queue`                                                                       |
| Event Grid サブスクリプション（Blob→`snowpipe-notify`） | `evgs-mss-{env}-blob-to-snowpipe-queue`                                                              |
| PostgreSQL Flexible Server                              | `psql-mss-{env}`                                                                                     |
| PostgreSQL Database（業務）                             | `mss`                                                                                                |
| PostgreSQL Database（Airflow メタデータ）               | `airflow`（同一 Flexible Server 上の別データベース）                                                 |
| Key Vault                                               | `kv-mss-{env}` （グローバル一意。衝突時はサフィックス追加）                                          |
| Container Registry                                      | `acrmss{env}` （同上）                                                                               |
| Log Analytics Workspace                                 | `log-mss-{env}`                                                                                      |
| Action Group                                            | `ag-mss-{env}-platform`                                                                              |
| Alert rule（例）                                        | `alert-mss-{env}-ca-5xx`                                                                             |
| Logic App                                               | `logic-mss-{env}-monitor-to-teams`                                                                   |
| Container Apps Environment（メイン）                    | `cae-mss-{env}`（Web / API / Batch / オーケストレーション実行 Jobs）                                 |
| Container Apps Environment（GitHub ランナー専用）       | `cae-mss-{env}-gha`                                                                                  |
| Container App（Web）                                    | `ca-mss-{env}-web`                                                                                   |
| Container App（API）                                    | `ca-mss-{env}-api`                                                                                   |
| Container App（Batch）                                  | `ca-mss-{env}-batch`                                                                                 |
| Container Apps Jobs（オーケストレーション実行）         | `caj-mss-{env}-orch-exec-*`（ジョブ種別ごとにサフィックス。命名は Terraform で確定）                 |
| Container Apps Jobs（GitHub Actions Runner）            | `caj-mss-{env}-gha-runner`                                                                           |
| Container Instance（Apache Airflow）                    | `ci-mss-{env}-airflow`                                                                               |
| Container Instance（Twingate Connector）                | `ci-mss-{env}-twingate-connector-01` （`prod` は `02` 以降を追加）                                   |
| Managed Identity（Web）                                 | `id-mss-{env}-web`                                                                                   |
| Managed Identity（API）                                 | `id-mss-{env}-api`                                                                                   |
| Managed Identity（Batch）                               | `id-mss-{env}-batch`                                                                                 |
| Managed Identity（Airflow）                             | `id-mss-{env}-airflow`                                                                               |
| Managed Identity（オーケストレーション実行 Jobs）       | `id-mss-{env}-orch-exec`                                                                             |
| Managed Identity（GitHub Actions Runner Job）           | `id-mss-{env}-gha-runner`                                                                            |
| Private DNS Zone（Container Apps Environment）          | **各 CAE** の `default_domain` 出力値を参照（メインと GitHub ランナー専用で **ゾーンは別**）         |
| Private DNS Zone（利用者向け）                          | `app.mss.internal` （`prod`） ／ `{env}.app.mss.internal`（`dev`/`stg`。例: `dev.app.mss.internal`） |
| Entra ID アプリ（App registration、Web）                | `app-mss-{env}-web`                                                                                  |
| Entra ID アプリ（App registration、API）                | `app-mss-{env}-api`                                                                                  |
| Entra ID アプリ（App registration、Airflow）            | `app-mss-{env}-airflow` （Web プラットフォームのリダイレクト URI）                                   |
| Entra ID エンタープライズアプリ（Web）                  | `entapp-mss-{env}-web`                                                                               |
| Entra ID エンタープライズアプリ（API）                  | `entapp-mss-{env}-api`                                                                               |
| Entra ID エンタープライズアプリ（Airflow）              | `entapp-mss-{env}-airflow`                                                                           |
| Entra ID エンタープライズアプリ（GitHub OIDC）          | `entapp-mss-{env}-gha-oidc` （`shared` スタック用は共有リソース表の `entapp-mss-shared-gha-oidc`）   |
| Entra ID セキュリティグループ（利用者）                 | `sg-mss-{env}-users`                                                                                 |
| Entra ID セキュリティグループ（Developer）              | `sg-mss-{env}-developers`（Airflow 等。メンバーは B2B 可）                                           |
| Entra ID セキュリティグループ（DB 開発者読み取り）      | `sg-mss-{env}-db-dev-reader`（常時有効）                                                             |
| Entra ID セキュリティグループ（DB 開発者特権）          | `sg-mss-{env}-db-dev-writer`（PIM で時間制限付き有効化）                                             |
| Entra ID セキュリティグループ（DB 業務データ参照）      | `sg-mss-{env}-db-biz-reader`（常時有効）                                                             |

## 共有リソース（環境横断）

| 種別                                                              | リソース名の例                                                          |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Resource Group（Terraform state 等）                              | `rg-mss-terraform-state`                                                |
| Storage Account（Terraform state）                                | `stmssterraformstate`                                                   |
| Private DNS Zone（PostgreSQL）                                    | `privatelink.postgres.database.azure.com`                               |
| Private DNS Zone（Blob）                                          | `privatelink.blob.core.windows.net`                                     |
| Private DNS Zone（Queue）                                         | `privatelink.queue.core.windows.net`                                    |
| Private DNS Zone（Key Vault）                                     | `privatelink.vaultcore.azure.net`                                       |
| Private DNS Zone（Container Registry）                            | `privatelink.azurecr.io`                                                |
| Log Analytics Workspace（共有監査ログ）                           | `log-mss-shared`                                                        |
| Entra ID テナント（アプリ利用者向け）                             | `mss-app-tenant`                                                        |
| Entra ID セキュリティグループ（運用者）                           | `sg-mss-platform-admins`                                                |
| Entra ID エンタープライズアプリ（GitHub OIDC、`shared` スタック） | `entapp-mss-shared-gha-oidc`（`infra/environments/shared` の CI/CD 用） |

## 関連ページ

- [環境・Terraform](./environment.md)
- [ネットワーク](./network.md)
