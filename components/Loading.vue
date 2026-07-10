<script setup lang="ts">
defineProps<{
  width?: string;
  height?: string
}>()

</script>

<template>
  <div class="loading inline-block" :style="{width, height}">&nbsp;</div>
</template>

<style scoped>
.loading {
  background:
    repeating-conic-gradient(
      color-mix(in srgb, var(--color-ink) 18%, transparent) 0% 25%,
      color-mix(in srgb, var(--color-ink) 8%, transparent) 0% 50%
    ) 0 0 / 12px 12px;
  animation: pixel-loading-march 0.9s steps(2, end) infinite;
}

/* One tile per cycle, stepped, so the checkers snap 6px at a time. */
@keyframes pixel-loading-march {
  to { background-position: 12px 0; }
}

@media (prefers-reduced-motion: reduce) {
  .loading { animation: none; }
}
</style>
