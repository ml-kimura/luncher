---
id: 1
title: 認証フロー
description: ログイン前後の画面遷移と、リセット・登録フローを示します。
---

<script setup>
import { useData } from 'vitepress'
const { theme, frontmatter } = useData()
const section = theme.value.docSections?.screen?.flow
</script>

# 認証フロー

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## フロー図

```mermaid
flowchart LR
    Login[ログイン] --> Home[ホーム]
    Home --> Features[各種機能]
    Features --> Logout[ログアウト]
    Logout --> Login

    Login --> Reset[パスワードリセット]
    Reset --> Register[ユーザー登録]
```

## 遷移ルール

1. ログイン成功後にホームへ遷移し、以降は認証必須画面のみアクセス可能。
2. ログアウト時はログイン画面へ戻り、セッションは破棄される。
3. パスワードリセット完了後はログイン画面へ戻り、必要に応じてユーザー登録に遷移できる。
