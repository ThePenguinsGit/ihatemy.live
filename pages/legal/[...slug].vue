<script setup lang="ts">
import type { Crumb } from '~/utils/docsNav';

defineRouteRules({
  robots: false,
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('legal').path(route.path).first()
})

const crumbs = computed<Crumb[]>(() => [
  { label: 'Home', to: '/' },
  { label: 'Legal' },
  { label: page.value?.title ?? 'Not found' },
])
</script>

<template>
  <div class="max-w-3xl mx-auto w-full flex flex-col gap-4">
    <template v-if="page">
      <header class="flex flex-col gap-1">
        <DocsBreadcrumbs :items="crumbs" />
        <h1 class="font-[minecraft] text-3xl md:text-4xl uppercase text-white drop-shadow leading-none mt-1">
          {{ page.title }}
        </h1>
      </header>
      <Card variant="panel" class="md:p-6">
        <ContentRenderer :value="page" class="content flex flex-col gap-3" />
      </Card>
    </template>

    <template v-else>
      <DocsBreadcrumbs :items="crumbs" />
      <Card variant="panel" class="md:p-6 flex flex-col gap-2">
        <h1 class="font-[minecraft] uppercase text-2xl">Page Not Found</h1>
        <p>Oops! The content you're looking for doesn't exist.</p>
        <NuxtLink class="underline" to="/docs">Go back home</NuxtLink>
      </Card>
    </template>
  </div>
</template>
