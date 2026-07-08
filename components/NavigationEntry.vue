<template>
  <div>
    <div :style="`margin-left: ${level * 20}px;`">
      <NuxtLink
        v-if="navigationItem.page !== false "
        class="text-xl px-1 w-full block transition-colors hover:bg-[var(--nav-hover)] hover:text-iceDeep"
        exact-active-class="bg-[var(--nav-active)] text-iceDeep font-bold"
        :to="navigationItem.path"
      >
        {{ navigationItem.title }}
      </NuxtLink>
      <span v-else class="w-full block text-xl">
        {{ navigationItem.title }}
      </span>
    </div>
    <div v-for="child in navigationItem.children">
      <NavigationEntry v-if="child.stem !== navigationItem.stem" :navigationItem="child" :level="level + 1"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import NavigationEntry from '~/components/NavigationEntry.vue';
import type { ContentNavigationItem } from '@nuxt/content';

defineProps<{
  level: number
  navigationItem: ContentNavigationItem
}>()
</script>
