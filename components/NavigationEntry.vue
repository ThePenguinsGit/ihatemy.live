<template>
  <div>
    <div  :style="`margin-left: ${level * 20}px;`"><NuxtLink class="text-2xl hover:underline hover:bg-green-100 rounded-sm active:bg-green-100 w-full block" exactActiveClass="bg-green-100" :to="navigationItem.path">{{ navigationItem.title }}</NuxtLink></div>
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
