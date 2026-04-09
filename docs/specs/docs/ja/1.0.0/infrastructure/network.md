# ネットワーク

ネットワーク関連のリソースについてまとめる。  
閉域ネットワーク実装の為の Twingate / Twingate Connector も本ページで扱う。

## ネットワークサービス

| リソース                            | 役割                                                                                                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Virtual Network**                 | 環境（`prod` / `stg` / `dev`）ごとに１つ。                                                                                                                                                                                                   |
| **Subnets**                         | 環境間で CIDR が重複しないようアドレス空間を割り当てる（[サブネット割り当て](#サブネット割り当て)）。                                                                                                                                    |
| **Firewall**                        | アウトバウンドを制御する。方針・許可先・SKU は、[Firewall](#firewall) 参照。                                                                                                                                                                 |
| **NSG**                             | サブネット単位のネットワークアクセス制御。必要最小限のインバウンド／アウトバウンド規則を定義。                                                                                                                                               |
| **Route Table（UDR）**              | デフォルトルート（`0.0.0.0/0`）を Firewall へ向け、アウトバウンド通信を強制経由させる。Container Apps / Twingate Connector 等の Subnet に関連付け。CAE サブネットに UDR を適用する要件のため **CAE は Workload profiles 環境を必須**とする。 |
| **Private Link / Private Endpoint** | PostgreSQL、Blob Storage、Key Vault、Container Registry、Queue Storage 等への閉域接続。                                                                                                                                                      |
| **Private DNS Zone**                | Private Link 先の種別ごとに Microsoft 定義のゾーン名がある。**同一サブスクリプションではゾーン名ごとに１リソース**とし、各環境の VNet を **VNet リンク**で接続する。                                                                         |
| **Twingate / Twingate Connector**   | ゼロトラスト経路の終端。各環境 VNet 内に専用の Twingate Connector配置（[Twingate](#twingate) 参照）。                                                                                                                                        |

## VNet アドレス空間

環境間で CIDR が重複しないよう、VNet ごとにアドレス空間を分離する。  
将来の VNet Peering やオンプレ接続に備え、RFC 1918 範囲内で互いに重複しない空間を確保する。

| 環境         | 環境プレフィックス | VNet CIDR     |
| ------------ | ------------------ | ------------- |
| 本番         | `prod`             | `10.1.0.0/16` |
| ステージング | `stg`              | `10.2.0.0/16` |
| 開発         | `dev`              | `10.3.0.0/16` |

## サブネット割り当て

1. サブネット名は `snet-mss-{env}-<用途>` とする（[リソース一覧](./resources.md))。`AzureFirewallSubnet` は Azure の要件で名前固定。
2. アドレスは `10.{環境番号}.{第3オクテット}.{第4オクテット}/マスク` と読み、**第3オクテット**で用途別の区画を表す。
3. **第3オクテット 7 以降**は未割り当て（将来のサブネット拡張用）。

※ 下表は **prod**（`10.1.0.0/16`）の例。`stg` / `dev` は第2オクテットを `10.2` / `10.3` に読み替え、サブネット名の環境プレフィックス部分も同様に置き換え。

| サブネット名                       | CIDR          | 区画（第3オクテット） | 用途                                                                                                   |
| ---------------------------------- | ------------- | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `snet-mss-prod-container-apps`     | `10.1.0.0/23` | 0〜1                  | メイン Container Apps Environment（Microsoft 要件で **/23 以上**）                                     |
| `AzureFirewallSubnet`              | `10.1.2.0/26` | 2                     | Firewall（名前固定、**/26 以上**）。**同じ第3オクテットの `/26` 外**は将来の追加サブネット用に空ける   |
| `snet-mss-prod-private-endpoints`  | `10.1.3.0/24` | 3                     | Private Endpoint 集約（PostgreSQL、Storage、Key Vault、ACR 等）                                        |
| `snet-mss-prod-twingate-connector` | `10.1.4.0/27` | 4                     | Twingate Connector（Container Instances。サイズは必要に応じて調整）                                    |
| `snet-mss-prod-container-apps-gha` | `10.1.5.0/23` | 5〜6                  | GitHub Actions ランナー専用 CAE（メイン CAE と **Firewall の送信元・許可先**を分けるため別サブネット） |

## Twingate

当システムは、社内システムの為、パブリックサブネットを用意せず、[Twingate](https://www.twingate.com/) を利用したプライベートな閉域ネットワーク内で提供する。

1. **Twingate 経由アクセス** : システムへのアクセス、データ分析時のデータベースへのアクセスは、**Twingate経由でのアクセスが必須**。
2. **Twingate Connector** : [Twingate公式 Azure用手順](https://www.twingate.com/docs/azure) に則って、**各環境の VNet 内**に、Container Instances で、専用の Twingate Connector を配置。
3. **Twingate Connector 冗長化** : Twingate Connector は、`prod` 2台、`dev` / `stg` は、1台ずつ。
4. **Connector Token** : Twingate Connector ごとに別トークンを用意し（使い回し禁止）、Key Vault で管理。更新は、ローリングアップデートで段階的に行う。
5. **リソース割り当て** : 必ず各リソースの **FQDN** を利用して定義する。
6. **Twingate SaaS 障害時**: ユーザーアクセスは Twingate 経由の為、 **アプリ全面停止に相当**する単一障害点として受容。

## 内部ドメイン

プライベートネットワークアクセスの為、システム専用の内部ドメインを設定。

### ルートドメイン、環境サブドメイン

| 環境           | ルートドメイン・環境サブドメイン |
| -------------- | -------------------------------- |
| `本番`         | `app.mss.internal`               |
| `ステージング` | `stg.app.mss.internal`           |
| `開発`         | `dev.app.mss.internal`           |

### リソース別サブドメイン

| リソース                     | FQDN (本番 / 非本番)                                             | 役割                                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Web アプリケーション`       | `web.app.mss.internal` / `web.{env}.app.mss.internal`            | Web アプリケーション（Container App（Web））用のブラウザからアクセスするドメイン。                                            |
| `REST API`                   | `api.app.mss.internal` / `api.{env}.app.mss.internal`            | REST API（Container App（REST API））用の Web アプリケーションやバッチからで呼び出すドメイン。                                |
| `AirFlow Web UI`             | `airflow.app.mss.internal` / `airflow.{env}.app.mss.internal`    | [Apache Airflow](https://airflow.apache.org/) Web UI（Container Instances）用のブラウザからアクセスするドメイン。運用者向け。 |
| `Container Apps Environment` | `<app-name>.<env-hash>.japaneast.azurecontainerapps.io` （共通） | Web アプリ、API、バッチに自動的に割り当てられるドメイン。 上記ドメインに紐付けられる。                                        |
| `Postgre SQL`                | `psql-mss-{env}.postgres.database.azure.com` （共通）            | データベース接続する為のドメイン。                                                                                            |

### 関連サービス

#### Private DNS Zone

A レコード、CNAME レコードは、ルートドメインを基準にすべて設定するのではなく、環境ごとの子ゾーンを設定し、リソースごとに各サブドメインを管理（[ルートドメイン、環境サブドメイン](#ルートドメイン、環境サブドメイン)）。

#### Container Apps Environment

CAE を internal ingress で作成すると、Azure が `<env-hash>.<region>.azurecontainerapps.io` 形式の**デフォルトドメイン**を自動生成し（**変更不可**）、各 Container App の FQDN は `<app-name>.<default-domain>` となる。

#### Database for PostgreSQL Flexible Server

1. Database for PostgreSQL Flexible Server の証明書を利用した暗号化通信を行う為、接続ホストは `{server-name}.postgres.database.azure.com`（公式 FQDN）に統一。
1. API などからの接続、データ分析や調査などの接続は、すべてこのドメインで行う。

## Private DNS Zone と VNet のリンク

1. **Private Link 用ゾーン** : **１サービス種別ごとに、サービスが規定するゾーン名で１ゾーン** とし、全 VNet をリンクする。
2. **CAE 用ゾーン** : **各環境ごと、CAE ごとに１ゾーン** とし、各環境の VNet のみをリンクする。 **ワイルドカード A レコード** で、当該 CAE 内部 LB の静的 IP へ解決する。
3. **サービス用ドメイン** : **各環境ごとのサブドメイン** と **各環境のVNet** を１対１でリンクする。

| 用途                                    | ゾーン種別   | Private DNS Zone 名（パターン）           | VNet リンク先                                             |
| --------------------------------------- | ------------ | ----------------------------------------- | --------------------------------------------------------- |
| Database for PostgreSQL Flexible Server | Private Link | `privatelink.postgres.database.azure.com` | `vnet-mss-dev`, `vnet-mss-stg`, `vnet-mss-prod`（全環境） |
| Blob Storage                            | Private Link | `privatelink.blob.core.windows.net`       | 同上                                                      |
| Queue Storage                           | Private Link | `privatelink.queue.core.windows.net`      | 同上                                                      |
| Key Vault                               | Private Link | `privatelink.vaultcore.azure.net`         | 同上                                                      |
| Container Registry                      | Private Link | `privatelink.azurecr.io`                  | 同上                                                      |
| CAE 既定ドメイン                        | 内部ドメイン | 各CAE 作成時に確定するドメイン名          | `vnet-mss-{env}`（**当該環境の VNet のみ**）              |
| 利用者向け内部ドメイン（本番）          | 内部ドメイン | `app.mss.internal`                        | `vnet-mss-prod`                                           |
| 利用者向け内部ドメイン（ステージング）  | 内部ドメイン | `stg.app.mss.internal`                    | `vnet-mss-stg`                                            |
| 利用者向け内部ドメイン（開発）          | 内部ドメイン | `dev.app.mss.internal`                    | `vnet-mss-dev`                                            |

## Firewall

閉域ネットワークでのサービス提供ではあるが、Twingate Connector イメージのプル や アプリケーションの Docker イメージのビルドなど、インターネット接続を必要とする部分がある為、リソースごとに接続可能な宛先を制限。

1. **SKU**: 全環境 **Basic** で開始。スループットをモニタリングし、**本番のみ**必要に応じて **Standard** へ。
1. **UDR（ユーザー定義ルート）** : UDR により、パブリック HTTPS 先への接続を **Firewall** 経由を強制。
1. **方針**: 外向きは **デフォルト拒否**とし、必要な **FQDN 等**だけを **Application Rules** で許可。

| 送信元                                               | 許可先                                          | プロトコル／ポート | 用途                                                                           |
| ---------------------------------------------------- | ----------------------------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| Container Apps Environment（Web／API／バッチ）       | `login.microsoftonline.com`                     | HTTPS（443）       | Entra ID 認証                                                                  |
| 同上                                                 | `management.azure.com`                          | HTTPS（443）       | Resource Manager によるサービスコール                                          |
| Container Apps Environment (GitHub Actions ランナー) | `github.com`, `*.actions.githubusercontent.com` | HTTPS（443）       | GitHub                                                                         |
| 同上                                                 | `*.azurecr.io`                                  | HTTPS（443）       | Container Registry へのサービス用イメージのプッシュ                            |
| 同上                                                 | `mcr.microsoft.com`, `*.data.mcr.microsoft.com` | HTTPS（443）       | サービス用イメージビルド時の Microsoft Container Registry からのイメージのプル |
| 同上                                                 | `イメージ作成時に適宜必要なホストを追加`        | HTTPS（443）       | `docker build` 時の必要なパッケージ取得、CI                                    |
| Container Instances (Apache Airflow)                 | `management.azure.com`                          | HTTPS（443）       | Resource Manager によるサービスコール                                          |
| 同上                                                 | `login.microsoftonline.com`                     | HTTPS（443）       | AirFlow Web UI の Entra ID 認証                                                |
| Container Instances (Twingate Connector)             | `*.twingate.com`                                | HTTPS（443）       | Twingate への接続                                                              |

## 関連ページ

- [コンテナ実行基盤](./containers.md)
- [ストレージ](./storage.md)
- [データベース](./database.md)
- [セキュリティ](./security.md)
- [クライアント事前調整](./client-alignment.md)（Entra／Twingate まわり）
