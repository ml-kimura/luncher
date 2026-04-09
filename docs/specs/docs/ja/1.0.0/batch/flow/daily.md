---
id: FLW-001
title: 日次バッチフロー
timing: 毎日 02:00
duration: 約1時間
description: 日次データの取込・集計・レポート生成
---

<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
const { frontmatter } = useData()
const section = theme.value.docSections?.batch?.flow
</script>

# FLW-001: 日次バッチフロー

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## フロー図

```mermaid
flowchart TD
    Start[開始] --> B001[BAT-001: データ取込]
    B001 --> B002[BAT-002: データ検証]
    B002 --> Check{検証結果}
    Check -->|OK| B003[BAT-003: データ集計]
    Check -->|NG| Error[エラー通知]
    B003 --> B004[BAT-004: レポート生成]
    B004 --> End[終了]
    Error --> End
```

## 実行順序

| 順序 | バッチID | バッチ名     | 依存関係 |
| ---- | -------- | ------------ | -------- |
| 1    | BAT-001  | データ取込   | なし     |
| 2    | BAT-002  | データ検証   | BAT-001  |
| 3    | BAT-003  | データ集計   | BAT-002  |
| 4    | BAT-004  | レポート生成 | BAT-003  |

## エラー時の動作

| 発生バッチ | 動作                               |
| ---------- | ---------------------------------- |
| BAT-001    | 処理中断、アラート通知             |
| BAT-002    | エラー通知後、後続バッチはスキップ |
| BAT-003    | 処理中断、アラート通知             |
| BAT-004    | 処理中断、アラート通知             |
