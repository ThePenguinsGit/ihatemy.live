<template>
  <div class="flex items-baseline justify-between mb-4">
    <h2 class="font-[minecraft] text-3xl uppercase text-white drop-shadow">
      <slot name="title"><slot>{{ title }}</slot></slot>
    </h2>
    <slot name="eyebrow">
      <slot name="aside">
        <NuxtLink v-if="eyebrow && to" :to="to" class="eyebrow !text-ice hover:underline" :target="target">{{ eyebrow }}</NuxtLink>
        <span v-else-if="eyebrow" class="eyebrow !text-ice">{{ eyebrow }}</span>
      </slot>
    </slot>
  </div>
</template>

<script setup lang="ts">
// Section header used across the landing page: pixel-font title on the left,
// optional ice-colored eyebrow on the right (a link when `to` is set).
// Title: `title` prop, or the #title / default slot. Eyebrow: `eyebrow` prop
// (a link when `to` is set), or the #eyebrow slot for custom right-side content.
// (#aside is kept as a legacy alias for #eyebrow.)
defineProps<{
  title?: string;
  eyebrow?: string;
  to?: string;
  target?: string;
}>();
</script>
