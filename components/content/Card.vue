<template>
  <component :is="as" :class="variantClass" class="p-4 md:p-5">
    <slot />
  </component>
</template>

<script setup lang="ts">
// Central surface component for the pixel/Minecraft-panel design language.
//  - flat  → .card       (bordered, hard drop shadow — docs/content, list rows)
//  - panel → .panel      (beveled inventory-slot look — landing sections)
//  - dark  → .panel-dark (beveled dark surface — hero, upsell)
// Also the MDC `::card` component used inside markdown (default = flat).
const props = withDefaults(defineProps<{
  variant?: 'flat' | 'panel' | 'dark';
  as?: string;
}>(), { variant: 'flat', as: 'div' });

const variantClass = computed(() => ({
  flat: 'card',
  panel: 'panel',
  dark: 'panel-dark',
}[props.variant]));
</script>
