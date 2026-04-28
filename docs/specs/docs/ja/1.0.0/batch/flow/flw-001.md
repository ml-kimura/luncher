---
id: FLW-001
title: 日次（午前）コラボランチ案内
timing: 毎日 10:00（JST）
duration: 目安 数分
description: 当日枠の作成と Slack 案内（US-001）
---

<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
const { frontmatter } = useData()
const section = theme.value.docSections?.batch?.flow
</script>

# FLW-001: 日次（午前）コラボランチ案内

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## フロー図

```mermaid
flowchart TD
  Start[スケジューラ 10:00 JST] --> B001[BAT-001: 日次コラボランチ案内配信]
  B001 --> End[終了]
```

## 実行順序

| 順序 | バッチ ID | バッチ名 | 依存関係 |
| ---- | --------- | -------- | -------- |
| 1 | BAT-001 | 日次コラボランチ案内配信 | なし |

## ユーザーストーリー

- [US-001](../../user-stories/us-001.md)

## 補足

- 本リポジトリに残っていた「データ取込」系の多段日次フローは、ランチドメイン定義に置き換え済み（本フローが正）。  
- マッチング等の午後以降のバッチは [US-003](../../user-stories/us-003.md) 系で別途 FLW 化する。
