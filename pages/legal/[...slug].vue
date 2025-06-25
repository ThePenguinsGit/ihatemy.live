<script setup lang="ts">
import NavigationEntry from '~/components/NavigationEntry.vue';
defineRouteRules({
  robots: false,
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('legal').path(route.path).first()
})
</script>

<template>
  <div class="w-full">
    <div class="flex flex-col gap-2 max-w-full w-[70rem] mx-auto">
      <template v-if="page">
        <ContentRenderer :value="page" class="content flex flex-col gap-2"/>
      </template>
      <template v-else>
        <div class="empty-page">
          <Card>
            <h1>Page Not Found</h1>
            <p>Oops! The content you're looking for doesn't exist.</p>
            <NuxtLink class="underline" to="/docs">Go back home</NuxtLink>
          </Card>
        </div>
      </template>
    </div>
  </div>
</template>

<style>
.content p > a {
  @apply underline text-secondary hover:text-secondaryLight;
}

img {
  @apply rounded-md;
}

tbody {
  @apply divide-y divide-solid;
}
tr {
  @apply divide-x divide-dashed;
}
td, th {
  @apply px-2;
}

h1 {
  @apply text-3xl;
}

h2 {
  @apply text-2xl;
}

h3 {
  @apply text-xl;
}

code {
  @apply bg-slate-200 px-1 rounded-sm;
}

ul {
  @apply list-disc list-inside;
}

ol {
  @apply list-decimal list-inside;
}
:not(h1, h2, h3) > a {
  @apply underline hover:text-secondaryLight;
}
</style>