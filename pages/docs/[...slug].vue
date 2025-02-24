<script setup lang="ts">
import NavigationEntry from '~/components/NavigationEntry.vue';

const { data: navigation } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('docs')
      .order('position', 'ASC')
})
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('docs').path(route.path).first()
})
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4">
    <nav class="card w-full md:w-48 block h-fit">
      <ul v-if="navigation">
        <NavigationEntry v-for="item in navigation[0].children" :navigation-item="item" :level="0"/>
      </ul>
    </nav>
    <div class="flex flex-col gap-2 max-w-full w-[70rem]">
      <template v-if="page">
        <Card class="text-4xl flex-none text-center">{{ page.pageTitle ?? page.title }}</Card>
        <ContentRenderer :value="page" class="content flex flex-col gap-2"/>
      </template>
      <template v-else>
        <div class="empty-page">
          <h1>Page Not Found</h1>
          <p>Oops! The content you're looking for doesn't exist.</p>
          <NuxtLink to="/">Go back home</NuxtLink>
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
  @apply bg-slate-200 px-1 rounded-md;
}

ul {
  @apply list-disc list-inside;
}
</style>