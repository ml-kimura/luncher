PR作成

以下を順番に実行してください。

```bash
current_branch="$(git branch --show-current)"
if [ "$current_branch" = "main" ] || [ "$current_branch" = "develop" ] || [ "$current_branch" = "staging" ]; then
  # 変更内容から conventional branch 名を決める
  changed_files="$(git diff --name-only)"
  if [ -z "$changed_files" ]; then
    changed_files="$(git diff --name-only --cached)"
  fi
  scope="$(printf "%s\n" "$changed_files" | head -n 1 | cut -d'/' -f1 | tr '[:upper:]' '[:lower:]' | tr -cd 'a-z0-9-')"
  if [ -z "$scope" ]; then
    scope="update"
  fi
  new_branch="chore/${scope}-$(date +%Y%m%d-%H%M)"
  echo "現在ブランチは $current_branch です。作業内容からブランチ名を生成: $new_branch"
  git switch -c "$new_branch"
fi

git status -sb
git diff
git log --oneline -10
gh pr create
```

`gh pr create` は対話形式で、タイトルと本文は今回の変更内容に合わせて入力してください。  
既存PRがある場合は新規作成せず、そのPR URLを表示してください。
