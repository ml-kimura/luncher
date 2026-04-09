# 監視

ログ集約・アラート・パフォーマンスの方針。出典は `infra/blueprint.md` の「監視／通知」「パフォーマンスモニタリング」「監視とアラート」。

## リソースと通知経路

| リソース                    | 役割                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Log Analytics Workspace** | メトリクス・リソース診断ログの集約。**Entra の監査・サインイン**等を**環境ワークスペース**へ転送。テナント／契約横断の監査は **`log-mss-shared`** へ。 |
| **Azure Monitor / Alerts**  | 閾値・異常検知。                                                                                                                                       |
| **Logic Apps**              | アラートを受け、**Teams Workflows Webhook URL** へ HTTP POST（Consumption。Teams コネクタの個人 OAuth は使わない）。                                   |
| **Teams**                   | インフラアラートの通知先。                                                                                                                             |

## ログとアラートの流れ

- 各リソースの**診断設定**と **Azure Monitor メトリクス**は、環境の **`log-mss-{env}`** に集約する。
- **Microsoft Defender for Cloud**（Foundational CSPM の推奨、Defender 由来のアラート含む）も **継続エクスポート**で Log Analytics に取り込み、**環境ごとの送信先を `log-mss-{env}` に合わせる**。
- **Azure Monitor のアラート** → **Action Group** → **Logic Apps** → Teams **Workflows Webhook**（**フォールバック**は同一 Action Group の**メール**）。Defender 由来も **ログ クエリベースのアラート**で同一経路に載せる。
- **Entra の監査・サインインログ**および **Azure アクティビティログ**（テナント／契約横断）は **`log-mss-shared`** に送信する。
- **KQL での閲覧権限は最小権限**とし、職務に応じて主体を分離。ワークスペースへの **Azure RBAC** は Terraform で定義する。
- **ログ保持期間**: 全ワークスペースで **１年間**。超過分は **Archive 層**へ移行し長期保持とコストを両立。

## パフォーマンス（APM は現時点では未導入）

- **コンテナ**: stdout/stderr を Log Analytics に転送。レプリカ状態・CPU/メモリは組み込みメトリクス。Batch の KEDA とキュー深度の推移を確認可能にする。
- **API**: Ingress のメトリクス（件数、p50/p95/p99、ステータス分布）。アプリは**構造化ログ**で処理時間を出力し KQL で分析。**シークレット・トークンのログ混入を防ぐ**。
- **DB**: `autovacuum`、`pg_stat_statements`、インデックス肥大化の定期確認、メンテナンスウィンドウとマイナー自動適用。
- **Web/API 可用性**: readiness / liveness / startup を定義。**最小レプリカ数 ≥ 1**（本番 Web/API でゼロスケールは採用しない）。revision モードはデプロイ戦略に合わせて選定。

## 初期閾値の目安（運用で調整）

- Web/API: 5xx 率 5分平均 2% → Warning、5% → Critical；p95 応答 1.5s → Warning、3s → Critical；再起動 10分で3回 → Warning
- リソース: CPU 15分平均 80%／90%、メモリ 85%／95%
- DB: 接続使用率 80%／90%、ストレージ 75%／85%
- `outbound` コンテナのファイル長時間残存 → Warning
- Queue: ポイズンキュー ≥ 1 → Warning；処理キュー深度閾値超過 → Warning
- Event Grid: デッドレター／ドロップ → Warning
- Web/API レプリカ数ゼロ（期待 > 0）→ Critical
- Key Vault 拒否・Firewall deny・認証失敗の急増は即時扱い

## 関連ページ

- [ストレージ](./storage.md)（Queue・ポイズン）
- [セキュリティ](./security.md)（監査ログ・PIM）
- [環境・Terraform](./environment.md)
- [リソース一覧](./resources.md)
