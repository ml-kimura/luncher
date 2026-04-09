# コンテナ実行基盤

Web / API / バッチ、GitHub Actions ランナー、Twingate Connector、Apache Airflow のホストとなる Azure コンテナ関連リソースの一覧。アウトバウンド制御は [ネットワーク](./network.md) の「Azure Firewall」を参照。

| リソース                                              | 役割                                                                                                                                                                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Container Instances**                               | Twingate Connector のホスト。                                                                                                                                                                                                                |
| **Container Apps Environment（メイン）**              | Web / API / バッチおよび**オーケストレーション実行**の Container Apps Jobs のホスト。**業務データを扱う**ワークロード向けに Firewall で許可先を限定。VNet 統合。**Workload profiles 環境**。                                                 |
| **Container Apps Environment（GitHub ランナー専用）** | **セルフホステッドランナー**用 Jobs のみ。**外向き HTTPS の要件が広い**ためメイン CAE と分離。VNet 統合。**Workload profiles 環境**。                                                                                                        |
| **Container App（Web）**                              | Next.js 等（スタックは確定時に更新）。Entra ID 認証。                                                                                                                                                                                        |
| **Container App（REST API）**                         | Hono 等（フレームワークは仮置き）。                                                                                                                                                                                                          |
| **Container App（Batch）**                            | キュー駆動のバッチ。ファイル着信の基本実装は `infra/file-triggered-batch.md`（リポジトリルート）。トリガー経路は [ストレージ](./storage.md)。                                                                                                |
| **Container Instances（Apache Airflow）**             | **ジョブオーケストレーション**（セルフホスト）。スケジューラと Web UI。ADF / Fabric のマネージド Airflow は採用しない。詳細は [ジョブオーケストレーション](./job-orchestration.md) および `infra/job-orchestration.md`（リポジトリルート）。 |
| **Container Apps Jobs（オーケストレーション実行）**   | Airflow の DAG タスクから起動する **run-to-completion** ジョブ。キュー駆動の Batch やランナー Jobs と役割を分ける。                                                                                                                          |
| **Container Apps Jobs（GitHub Actions Runner）**      | オンデマンドでランナーを起動し **CI/CD を VNet 内で実行**。**GitHub ランナー専用 CAE** のみに配置。                                                                                                                                          |

## ネットワーク・原則（要約）

- CAE サブネットは **/23 以上**。UDR 適用のため **Workload profiles 必須**（[ネットワーク](./network.md)）。
- Container Apps の **`external ingress` はデフォルト無効**（internal ingress）。利用者アクセスは **Twingate 経由**を前提。
- シークレットは **`env.secret_name` と `secret` 定義（または Key Vault 参照）をセット**で揃え、平文を `env.value` に入れない（[セキュリティ](./security.md)）。

## 関連ページ

- [ネットワーク](./network.md)
- [ストレージ](./storage.md)
- [データベース](./database.md)
- [CI/CD](./ci-cd.md)
- [リソース一覧](./resources.md)
