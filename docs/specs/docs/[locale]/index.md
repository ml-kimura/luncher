<script setup>
import { onMounted } from 'vue'
import { useRouter, useData, withBase } from 'vitepress'

const router = useRouter()
const { theme, localeIndex } = useData()

onMounted(() => {
  const latestVersion = theme.value.versions ? theme.value.versions[0] : ''
  if (latestVersion) {
    router.go(withBase(`/${localeIndex.value}/${latestVersion}/`) + window.location.search)
  }
})
</script>
