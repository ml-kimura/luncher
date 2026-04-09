# Runtime API Examples

This page demonstrates usage of some of the runtime APIs provided by VitePress.

<script setup>
import { useData } from 'vitepress'

const { site, frontmatter } = useData()
</script>

## Results

### Theme Data
<pre>{{ site.themeConfig }}</pre>

### Frontmatter
<pre>{{ frontmatter }}</pre>

### More
Check out the documentation for the [full list of runtime APIs](https://vitepress.dev/reference/runtime-api#usedata).
