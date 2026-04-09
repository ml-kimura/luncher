---
id: FLW-002
title: Monthly Batch Flow
timing: 1st of month at 03:00
duration: Approx. 2 hours
description: Monthly aggregation and billing
---

<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
const { frontmatter } = useData()
const section = theme.value.docSections?.batch?.flow
</script>

# FLW-002: Monthly Batch Flow

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## Flow Diagram

```mermaid
flowchart TD
    Start[Start] --> B010[BAT-010: Monthly Aggregation]
    B010 --> B011[BAT-011: Billing Data Creation]
    B011 --> B012[BAT-012: Invoice Generation]
    B012 --> End[End]
```

## Execution Order

| Order | Batch ID | Batch Name            | Dependency |
| ----- | -------- | --------------------- | ---------- |
| 1     | BAT-010  | Monthly Aggregation   | None       |
| 2     | BAT-011  | Billing Data Creation | BAT-010    |
| 3     | BAT-012  | Invoice Generation    | BAT-011    |

## Error Behavior

| Source Batch | Behavior                          |
| ------------ | --------------------------------- |
| BAT-010      | Abort process, alert notification |
| BAT-011      | Abort process, alert notification |
| BAT-012      | Abort process, alert notification |
