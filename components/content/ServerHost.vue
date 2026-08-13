<template>
  <code v-if="code">{{ host }}</code>
  <template v-else>{{ host }}</template>
</template>

<script setup lang="ts">
import { serverHostname } from '~/utils/site';

const props = defineProps<{ shortName: string, code?: boolean }>();

const host = computed(() => serverHostname(props.shortName));
</script>
