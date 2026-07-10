<template>
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-x-2 gap-y-1">
    <template v-for="(item, i) in items" :key="i">
      <NuxtLink
        v-if="item.to && i < items.length - 1"
        :to="item.to"
        class="eyebrow !text-ice hover:!text-white transition-colors"
      >{{ item.label }}</NuxtLink>
      <span v-else class="eyebrow !text-white/70">{{ item.label }}</span>
      <span v-if="i < items.length - 1" class="eyebrow !text-white/30" aria-hidden="true">/</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
// Dumb breadcrumb renderer over a dark page background; the parent builds the trail.
import type { Crumb } from '~/utils/docsNav';

defineProps<{ items: Crumb[] }>();
</script>
