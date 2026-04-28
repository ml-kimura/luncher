main ブランチへ切り替えて最新化する

以下を順番に実行:

```bash
git switch main
git fetch origin main
git pull --ff-only origin main
git status -sb
```

失敗した場合は、失敗したコマンドとエラーメッセージをそのまま報告する。
