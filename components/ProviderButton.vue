<template>
  <!-- Full page navigation (server OAuth route), so a plain <a>, not NuxtLink. -->
  <a :href="href" class="provider-btn">
    <span class="provider-btn__icon" :style="{ background: brand }">
      <slot name="icon" />
    </span>
    <span class="grow text-left">
      <span class="block font-[minecraft] uppercase tracking-wide text-lg leading-tight">{{ label }}</span>
      <span v-if="sublabel" class="block text-white/60 text-sm leading-tight normal-case">{{ sublabel }}</span>
    </span>
    <span class="font-[minecraft] text-ice text-2xl" aria-hidden="true">→</span>
  </a>
</template>

<script setup lang="ts">
// A chunky pixel-panel button for an identity provider on the login page.
// `brand` tints the icon chip; the icon itself goes in the #icon slot.
defineProps<{ href: string; label: string; sublabel?: string; brand: string }>();
</script>

<style scoped>
@reference "~/assets/css/main.css";

.provider-btn {
  @apply flex items-center gap-4 w-full p-3 text-white transition-transform;
  background: var(--color-secondary);
  border: 4px solid var(--panel-border);
  box-shadow: 0 4px 0 var(--panel-drop);
}
.provider-btn:hover { @apply -translate-y-0.5; }
.provider-btn:active { @apply translate-y-0.5; box-shadow: 0 1px 0 var(--panel-drop); }
.provider-btn:focus-visible { @apply outline-2 outline-offset-2; outline-color: var(--focus-ring); }

.provider-btn__icon {
  @apply flex items-center justify-center w-12 h-12 shrink-0 text-white;
  border: 2px solid var(--panel-border);
}
.provider-btn__icon :deep(svg) { @apply w-7 h-7; }
</style>
