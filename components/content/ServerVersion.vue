<template>
  <code v-if="version">{{ version }}</code>
  <span v-else class="opacity-60" title="Server offline or version unavailable">—</span>
</template>

<script setup lang="ts">
// Inline MDC component (`:server-version{short-name="atm10"}`) that shows a
// server's current version, pulled live from the same all-alive-servers
// endpoint the landing page uses. Falls back to a dash when the server isn't
// currently alive (that endpoint only lists running servers).
import type ServerStatusInterface from '~/interfaces/ServerStatusInterface';

const props = defineProps<{ shortName: string }>();

const { data } = await useApiFetch<ServerStatusInterface[]>('/all-alive-servers');

const version = computed(
  () => data.value?.find((server) => server.shortName === props.shortName)?.version,
);
</script>
