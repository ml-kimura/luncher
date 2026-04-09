---
id: FLW-001
title: Daily Batch Flow
timing: Daily at 02:00
duration: Approx. 1 hour
description: Data import, aggregation, and report generation
---

<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
const { frontmatter } = useData()
const section = theme.value.docSections?.batch?.flow
</script>

# FLW-001: Daily Batch Flow

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## Flow Diagram

```mermaid
flowchart TD
    Start[Start] --> B001[BAT-001: Data Import]
    B001 --> B002[BAT-002: Data Validation]
    B002 --> Check{Validation Result}
    Check -->|OK| B003[BAT-003: Data Aggregation]
    Check -->|NG| Error[Error Notification]
    B003 --> B004[BAT-004: Report Generation]
    B004 --> End[End]
    Error --> End
```

## Execution Order

| Order | Batch ID | Batch Name        | Dependency |
| ----- | -------- | ----------------- | ---------- |
| 1     | BAT-001  | Data Import       | None       |
| 2     | BAT-002  | Data Validation   | BAT-001    |
| 3     | BAT-003  | Data Aggregation  | BAT-002    |
| 4     | BAT-004  | Report Generation | BAT-003    |

## Error Behavior

| Source Batch | Behavior                                    |
| ------------ | ------------------------------------------- |
| BAT-001      | Abort process, alert notification           |
| BAT-002      | Error notification, skip subsequent batches |
| BAT-003      | Abort process, alert notification           |
| BAT-004      | Abort process, alert notification           |
