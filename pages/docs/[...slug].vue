<script setup lang="ts">
import { flattenNavigation } from '~/utils/docsNav';
import type { Crumb } from '~/utils/docsNav';

const route = useRoute()
if (route.path === '/docs') {
  await navigateTo('/docs/getting-started')
}

const { data: navigation } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('docs')
      .order('position', 'ASC')
})
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('docs').path(route.path).first()
})

useSeoMeta({
  title: page.value?.pageTitle ?? page.value?.title ?? '404',
  description: page.value?.description,
  ogTitle: page.value?.pageTitle ?? page.value?.title ?? '404',
  ogDescription: page.value?.description,
  ...(page.value?.seo || {}),
})

// Flatten the nav tree once for paging + breadcrumb title lookups.
const flat = computed(() => flattenNavigation(navigation.value))
const titleByPath = computed(() =>
  Object.fromEntries(flat.value.map((i) => [i.path, i.title])),
)

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

const crumbs = computed<Crumb[]>(() => {
  const segments = route.path.split('/').filter(Boolean)
  const items: Crumb[] = [{ label: 'Home', to: '/' }]
  let acc = ''
  segments.forEach((segment, i) => {
    acc += `/${segment}`
    if (segment === 'docs') {
      items.push({ label: 'Docs', to: '/docs/getting-started' })
      return
    }
    const isLast = i === segments.length - 1
    const known = titleByPath.value[acc]
    items.push({
      label: known ?? cap(segment),
      to: isLast || !known ? undefined : acc,
    })
  })
  return items
})

const currentIndex = computed(() => flat.value.findIndex((i) => i.path === route.path))
const prev = computed(() =>
  currentIndex.value > 0 ? flat.value[currentIndex.value - 1] : null,
)
const next = computed(() =>
  currentIndex.value >= 0 && currentIndex.value < flat.value.length - 1
    ? flat.value[currentIndex.value + 1]
    : null,
)

const toc = computed(() => page.value?.body?.toc?.links ?? [])
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto w-full">
    <DocsSidebar :items="navigation?.[0]?.children ?? []" />

    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <template v-if="page">
        <header class="flex flex-col gap-1">
          <DocsBreadcrumbs :items="crumbs" />
          <h1 class="font-[minecraft] text-3xl md:text-4xl uppercase text-white drop-shadow leading-none mt-1">
            {{ page.pageTitle ?? page.title }}
          </h1>
          <p v-if="page.description" class="text-white/70">{{ page.description }}</p>
        </header>

        <Card variant="panel" class="md:p-6">
          <ContentRenderer :value="page" class="content flex flex-col gap-3" />
        </Card>

        <DocsPager :prev="prev" :next="next" />
      </template>

      <template v-else>
        <DocsBreadcrumbs :items="[{ label: 'Home', to: '/' }, { label: 'Docs', to: '/docs/getting-started' }, { label: 'Not found' }]" />
        <Card variant="panel" class="md:p-6 flex flex-col gap-2">
          <h1 class="font-[minecraft] uppercase text-2xl">Page Not Found</h1>
          <p>Oops! The content you're looking for doesn't exist.</p>
          <NuxtLink class="underline" to="/docs">Go back to the docs</NuxtLink>
        </Card>
      </template>
    </div>

    <DocsToc v-if="page && toc.length" :links="toc" class="hidden xl:block" />
  </div>
</template>
