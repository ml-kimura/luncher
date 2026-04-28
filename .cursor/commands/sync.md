指定ブランチへ切り替えて最新化する（未指定時は main）

以下を順番に実行してください。

```bash
TARGET_BRANCH="${1:-main}"
git switch "$TARGET_BRANCH"
git fetch origin "$TARGET_BRANCH"
git pull --ff-only origin "$TARGET_BRANCH"
git status -sb
```

失敗した場合は、どのコマンドで失敗したかとエラーメッセージをそのまま報告してください。
