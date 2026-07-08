<template>
  <Card as="nav" variant="panel" class="w-full lg:w-56 lg:sticky top-4 h-fit shrink-0">
    <div class="eyebrow mb-1">The Penguin Network</div>
    <h2 class="font-[minecraft] uppercase text-2xl leading-none">Docs</h2>
    <hr class="border-ink/15 my-2" />
    <ul>
      <NavigationEntry v-for="item in items" :key="item.path" :navigation-item="item" :level="0" />
    </ul>
  </Card>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content';

defineProps<{ items: ContentNavigationItem[] }>();
</script>
