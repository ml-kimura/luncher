---
id: SCR-FLW-001
title: Authentication Flow
description: Shows the transitions around login, logout, password reset, and registration.
---

<script setup>
import { useData } from 'vitepress'
const { theme, frontmatter } = useData()
const section = theme.value.docSections?.screen?.flow
</script>

# SCR-FLW-001: Authentication Flow

<BasicInfo
  v-if="section"
  :title="section.infoTitle"
  :fields="section.fields"
  :data="frontmatter"
/>

## Flow Diagram

```mermaid
flowchart LR
    Login[Login] --> Home[Home]
    Home --> Features[Features]
    Features --> Logout[Logout]
    Logout --> Login

    Login --> Reset[Password Reset]
    Reset --> Register[User Registration]
```

## Transition Rules

1. After successful login, the user is taken to Home and can access authenticated pages only.
2. Logging out always returns to the Login screen and clears the session.
3. Password reset returns to Login; from there users may proceed to registration if needed.
