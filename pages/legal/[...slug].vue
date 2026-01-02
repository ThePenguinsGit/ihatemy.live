<script setup lang="ts">
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