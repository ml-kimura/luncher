---
id: 2
title: メインフロー
description: ホーム画面から各機能画面への遷移と、設定画面間の関係を示します。
---

<script setup>
import { useData } from 'vitepress'
const { theme, frontmatter } = useData()
const section = theme.value.docSections?.screen?.flow
</script>

# メインフロー

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## フロー図

```mermaid
flowchart TD
    Home[ホーム] --> Notifications[通知一覧]
    Home --> Profile[プロフィール設定]
    Home --> Account[アカウント設定]
    Account --> Security[セキュリティ設定]
```

## 遷移ルール

1. ホーム画面から各機能画面へ直接遷移可能。
2. アカウント設定からのみセキュリティ設定へアクセスできる。
3. 通知一覧や設定画面からホームへは共通のナビゲーションで戻れる。
