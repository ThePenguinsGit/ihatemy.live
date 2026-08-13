<template>
    <div id="background" class="w-full h-screen max-h-screen">
      <SiteHeader />
      <div class="wrapper flex flex-col justify-between">
        <NuxtPage class="px-4 pt-4 pb-16 md:pb-4 " />
        <footer class="w-full bg-secondary border-t-4 border-ink py-1 text-center text-white text-sm font-[minecraft] uppercase tracking-wide shrink-0">
          <NuxtLink to="/legal/imprint" class="no-underline hover:text-ice">Imprint</NuxtLink>
          <span class="text-white/40 mx-2">·</span>
          <NuxtLink to="/legal/privacy" class="no-underline hover:text-ice">Privacy Policy</NuxtLink>
        </footer>
      </div>
    </div>
</template>

<script setup lang="ts">
import { SITE_NAME, siteUrl } from '~/utils/site';
const route = useRoute()

const canonical = computed(() => {
  const page = Number.parseInt(String(route.query.page), 10)
  const suffix = Number.isInteger(page) && page > 1 ? `?page=${page}` : ''
  return siteUrl(`${route.path}${suffix}`)
})

useHead({
  titleTemplate: (title) =>
    title && title !== SITE_NAME
      ? `${title} · ${SITE_NAME}`
      : SITE_NAME,
  link: [{ rel: 'canonical', href: canonical }],
  meta: [{ property: 'og:url', content: canonical }],
})

defineOgImage('PenguinCard')
</script>

<style lang="scss">
@reference "~/assets/css/main.css";

html {
  background: var(--color-secondary) url('/img/background.png') repeat;
}

.wrapper {
  @apply overflow-y-auto;
  height: calc(100vh - 5rem); /* header is h-20 (5rem) */
}


</style>