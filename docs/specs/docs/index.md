<script setup>
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'
import { defaultLocale } from './.vitepress/constants'

const router = useRouter()

onMounted(() => {
  // Redirect to default locale root, which will then redirect to the latest version
  router.go(withBase(`/${defaultLocale}/`) + window.location.search)
})
</script>
