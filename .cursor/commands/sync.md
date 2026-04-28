指定ブランチへ切り替えて最新化する（未指定時は `main`）

AI は次を順番に実行してください。

1. ユーザーが `/sync <branch>` を指定した場合は `<branch>` をターゲットブランチにする。
2. 引数がない場合はターゲットブランチを `main` にする。
3. 次のコマンドをターゲットブランチ名に置換して実行する。

```bash
git switch <TARGET_BRANCH>
git fetch origin <TARGET_BRANCH>
git pull --ff-only origin <TARGET_BRANCH>
git status -sb
```

失敗した場合は、失敗したコマンドとエラーメッセージをそのまま報告してください。
