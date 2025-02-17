<script setup lang="ts">
import NavigationEntry from '~/components/NavigationEntry.vue';

const { data: navigation } = await useAsyncData('navigation', () => {
  return queryCollectionNavigation('docs')
})

const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('docs').path(route.path).first()
})
</script>

<template>
  <div class="flex flex-row gap-4">
    <nav class="card w-48 block h-fit">
      <ul v-if="navigation">
        <NavigationEntry v-for="item in navigation[0].children" :navigation-item="item" :level="0"/>
      </ul>
    </nav>
    <div class="card min-h-max flex-grow">
      <template v-if="page">
        <h1 class="text-3xl">{{ page.title }}</h1>
        <hr class="my-2">
        <ContentRenderer :value="page" />
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
tbody {
  @apply divide-y divide-solid;
}
tr {
  @apply divide-x divide-dashed;
}
td, th {
  @apply px-2;
}
</style>