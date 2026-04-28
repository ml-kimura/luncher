mainブランチへ切り替えて最新化

以下を順番に実行してください。

```bash
git switch main
git fetch origin main
git pull --ff-only origin main
git status -sb
```

失敗した場合は、どのコマンドで失敗したかとエラーメッセージをそのまま報告してください。
