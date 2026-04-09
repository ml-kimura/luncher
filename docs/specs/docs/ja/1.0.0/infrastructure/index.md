# インフラストラクチャー

## 概要

本セクションは、Azure 上のインフラ設計を説明します。設計のたたき台・詳細はリポジトリルートの `infra/blueprint.md` にあり、本ドキュメントは VitePress 向けに章ごとに分割したものです。

::: tip ナビゲーション
サイドバーに未掲載のページ（リソース一覧・コンテナ基盤など）は、下表のリンクから直接開けます。
:::

## ドキュメント構成

| ページ                                               | 説明                                                              | blueprint の主な対応章                                      |
| ---------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------- |
| [システム関連図](./system-diagram.md)                | システム全体の関連図（整備中）                                    | —                                                           |
| [データフロー図](./data-flow-diagram.md)             | データフロー（整備中）                                            | —                                                           |
| [インフラ構成図](./infrastructre-diagram.md)         | デプロイ構成図（整備中）                                          | —                                                           |
| [ネットワーク](./network.md)                         | VNet・サブネット・DNS・内部ドメイン・Firewall・Twingate Connector | Azure リソース構成（ネットワーク／Firewall／Twingate 原則） |
| [ストレージ](./storage.md)                           | Blob・Queue・Event Grid・ファイル着信バッチ連携                   | ストレージ・イベント駆動                                    |
| [データベース](./database.md)                        | アプリ DB（Atlas／マイグレーション）および Azure PostgreSQL 基盤  | データストア・接続数設計                                    |
| [コンテナ実行基盤](./containers.md)                  | CAE・Container Apps・ACI・Jobs                                    | コンテナ実行基盤                                            |
| [ジョブオーケストレーション](./job-orchestration.md) | Airflow と Container Apps Jobs                                    | ジョブオーケストレーション                                  |
| [リソース一覧（命名）](./resources.md)               | 環境別・共有リソースの命名例                                      | リソース名リスト                                            |
| [セキュリティ](./security.md)                        | 境界・シークレット・Entra／OAuth 方針                             | セキュリティ原則・アイデンティティ・認証認可                |
| [監視](./monitor.md)                                 | Log Analytics・アラート・パフォーマンス                           | 監視／通知・監視とアラート                                  |
| [バックアップ](./backup.md)                          | バックアップ・DR 目標                                             | バックアップ・DR                                            |
| [CI/CD](./ci-cd.md)                                  | ACR・GitHub Actions・イメージ配布                                 | CI/CD・イメージ配布                                         |
| [環境・Terraform](./environment.md)                  | 環境ディレクトリ・モジュール・Terraform 対象外                    | Terraform リポジトリ構成                                    |
| [コスト管理](./cost-management.md)                   | 可視化・予算・レビュー・是正の運用（責務・Cost Management・タグ） | —                                                           |
| [クライアント事前調整](./client-alignment.md)        | Entra／Twingate まわりの要調整事項・依頼テンプレ                  | 要調整事項                                                  |

## 管理範囲と連携想定（要約）

- **Terraform** で管理するのは **Azure 上のリソースまで**。
- **データ連携の責任境界**は **Azure Blob Storage まで**（Snowflake 側は本リポジトリ外）。
- **閉域・Private Endpoint** を前提とし、**業務データに個人情報を含めない前提**（クライアント確定）。Entra／Azure の監査ログには個人に紐づき得る情報が含まれ得る。

詳細は `infra/blueprint.md` の「管理範囲と連携想定」を参照してください。
