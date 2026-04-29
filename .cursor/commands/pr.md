PR作成

参照仕様: Conventional Branch 1.0.0 https://conventional-branch.github.io/#specification

AI が以下を実行してください。

1. 現在ブランチが `main` / `develop` / `staging` の場合のみ、変更差分を要約して Conventional Branch 形式 (`type/description`) の候補を1つ提案する
   - `type`: `feature|feat|bugfix|fix|hotfix|release|chore`
2. `main` / `develop` / `staging` の場合のみ、ユーザーに「このブランチ名で作成してよいか」を確認する（yes/no）
3. `main` / `develop` / `staging` の場合のみ、yes なら提案名、no ならユーザー指定名でブランチ作成する
4. それ以外のブランチでは、ブランチ提案・作成は行わず現在ブランチのまま進める
5. 変更内容を確認し、必要なファイルを `git add` する
6. 変更の意図に沿ったコミットメッセージを作成して `git commit` する
7. `git push -u origin HEAD` で現在ブランチをpushする
8. 変更内容を要約してタイトル/本文を作成し、`gh pr create --title "..." --body "$(cat <<'EOF' ... EOF)"` 形式で新規PRを作成する
