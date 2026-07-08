<template>
  <component
    :is="tag"
    :to="to || undefined"
    :href="href || undefined"
    :target="href ? (target ?? '_blank') : undefined"
    :rel="href ? 'noopener' : undefined"
    :type="isButton ? type : undefined"
    :disabled="isButton ? (disabled || undefined) : undefined"
    class="pixel-btn"
    :class="{ 'pixel-btn--primary': primary, 'pixel-btn--danger': danger }"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
// Central chunky pixel button. Renders as:
//  - <NuxtLink> when `to` is set (internal nav)
//  - <a>        when `href` is set (external; opens in a new tab by default)
//  - <button>   otherwise
const props = withDefaults(defineProps<{
  to?: string;
  href?: string;
  primary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit';
  target?: string;
}>(), { type: 'button' });

const NuxtLink = resolveComponent('NuxtLink');
const tag = computed(() => (props.to ? NuxtLink : props.href ? 'a' : 'button'));
const isButton = computed(() => !props.to && !props.href);
</script>
