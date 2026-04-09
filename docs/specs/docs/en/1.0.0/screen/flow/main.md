---
id: SCR-FLW-002
title: Main Flow
description: Illustrates the navigation from Home to key feature pages and settings.
---

<script setup>
import { useData } from 'vitepress'
const { theme, frontmatter } = useData()
const section = theme.value.docSections?.screen?.flow
</script>

# SCR-FLW-002: Main Flow

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## Flow Diagram

```mermaid
flowchart TD
    Home[Home] --> Notifications[Notifications]
    Home --> Profile[Profile Settings]
    Home --> Account[Account Settings]
    Account --> Security[Security Settings]
```

## Transition Rules

1. Users can navigate directly from Home to each feature page.
2. Security settings is accessible only through Account settings.
3. All feature pages provide navigation back to Home.
