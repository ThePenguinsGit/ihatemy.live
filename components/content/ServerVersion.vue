<template>
  <code v-if="version">{{ version }}</code>
  <span v-else class="opacity-60" title="Server offline or version unavailable">—</span>
</template>

<script setup lang="ts">
const props = defineProps<{ shortName: string }>();
const server = useServer(() => props.shortName);
const version = computed(() => server.value?.version);
</script>
