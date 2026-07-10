<template>
  <nav v-if="prev || next" class="flex flex-wrap gap-3 justify-between" aria-label="Pagination">
    <PixelButton v-if="prev" :to="prev.path" class="!px-3">
      <span class="flex flex-col items-start leading-tight">
        <span class="text-[11px] opacity-70">‹ Prev</span>
        <span class="text-sm normal-case">{{ prev.title }}</span>
      </span>
    </PixelButton>
    <span v-else />

    <PixelButton v-if="next" :to="next.path" primary class="!px-3 ml-auto">
      <span class="flex flex-col items-end leading-tight">
        <span class="text-[11px] opacity-70">Next ›</span>
        <span class="text-sm normal-case">{{ next.title }}</span>
      </span>
    </PixelButton>
  </nav>
</template>

<script setup lang="ts">
import type { DocsNavLeaf } from '~/utils/docsNav';

defineProps<{
  prev: DocsNavLeaf | null;
  next: DocsNavLeaf | null;
}>();
</script>
