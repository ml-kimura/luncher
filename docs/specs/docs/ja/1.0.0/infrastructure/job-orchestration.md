# ジョブオーケストレーション

**Blob → Queue → バッチ**とは別経路で、**DAG とスケジュール**は **セルフホストの Apache Airflow**（**Container Instances** 上のスケジューラ＋Web UI）が担い、**実処理**は **Container Apps Jobs** のコンテナで実行する。

インフラ上の責務分担・タイマーバッチとオーケストレータの分離・冪等性などの**実装方針の詳細**は、リポジトリルートの **`infra/job-orchestration.md`** を参照する。本ページはブループリント上のインフラ前提の要約である。

## 可用性（ブループリント）

- Airflow は **ACI 上の単一コンテナグループ**とし、**スケジューラ／Web のマルチインスタンス冗長化は採用しない**。障害時は **コンテナの再起動**で復旧する。本前提は [バックアップ・DR](./backup.md) の RTO/RPO と整合させる。

## ネットワーク・認証

- Airflow は **Private Endpoint 経由**で **同一 PostgreSQL Flexible Server** の **Airflow 用データベース**（メタデータ）に接続する。
- Container Apps Jobs の起動は **ARM API** と **Managed Identity**（RBAC）で行う。
- **外向き HTTPS の許可先**は [ネットワーク](./network.md) の「Azure Firewall」の **ACI 上の Apache Airflow** の行に従う。実装時に必要な RBAC と公式エンドポイントは列挙・検証して最小権限で確定する。
- **キュー駆動の Batch**（[ストレージ](./storage.md)）と **混同しない**。用途・スケール・監視を分ける。

## Web UI 認証

- **Microsoft Entra ID**（OpenID Connect）。**Airflow 専用**の **App registration** と **エンタープライズアプリ**。
- コールバックは Airflow サーバが受けるため、Entra では **Web** プラットフォームの **リダイレクト URI** を登録する。
- **サインイン可能なユーザー**は **Developer セキュリティグループ**に限定する。初期は当該グループを **Airflow の Admin** にマッピングする。

## 関連ページ

- [コンテナ実行基盤](./containers.md)
- [データベース](./database.md)
- [ネットワーク](./network.md)
- [セキュリティ](./security.md)
- [監視](./monitor.md)
