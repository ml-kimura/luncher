作業ブランチの確認と削除を行う（`local` / `remote`、未指定は `local`）

AI は次を順番に実行してください。

1. 第1引数を対象種別として解釈する。
   - `/branch-cleanup remote` の場合: 対象は `remote`
   - 引数未指定または `local` 指定の場合: 対象は `local`
2. 保護ブランチを `main`, `develop`, `staging` として扱う。
3. 対象種別に応じて削除候補を作る。
   - `local`: ローカルブランチ一覧から保護ブランチを除外
   - `remote`: `origin/*` のリモートブランチ一覧から保護ブランチ（`origin/main` など）を除外
4. 各候補について次を取得し、番号付きで一覧表示する。
   - ブランチ名
   - 変更内容サマリ（`git diff --shortstat main...<branch>`）
   - 最新コミット要約（`git log -1 --oneline <branch>`）
5. ユーザーに「削除する番号」を確認する（複数指定可、例: `1,3,5`）。
6. 指定番号のブランチを削除する。
   - `local` の場合:
     - 原則 `git branch -d <branch>`
     - マージ未済で `-d` が失敗した場合のみ、ユーザーに強制削除可否を確認して `git branch -D <branch>` を実行
   - `remote` の場合:
     - 原則 `git push origin --delete <branch>`
     - 失敗した場合はエラー内容を報告し、再実行可否をユーザー確認
7. 削除後の残ブランチ一覧を再表示する。

実行時の注意:

- `local` では現在チェックアウト中のブランチを削除対象に含めない。
- `remote` では `origin/HEAD` を削除対象に含めない。
- 失敗した場合は、失敗したコマンドとエラーをそのまま報告する。
