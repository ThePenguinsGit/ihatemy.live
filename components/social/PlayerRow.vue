<template>
  <li class="flex items-center gap-2.5 px-3 py-1.5 min-h-10">
    <span class="status-pixel" :class="{ 'is-online': player.online }" :title="player.online ? 'Online' : 'Offline'" />
    <McHead :uuid="player.uuid" alt="" class="w-5 h-5 shrink-0" />
    <span class="min-w-0 max-w-[60%] shrink-0 truncate" :class="{ 'text-white/55': !player.online }">
      <template v-if="player.displayName ?? player.name">{{ player.displayName ?? player.name }}</template>
      <template v-else>unknown player <span class="text-white/40">{{ player.uuid.slice(0, 8) }}</span></template>
      <span v-if="you" class="text-white/55"> (you)</span>
      <span class="sr-only">, {{ player.online ? `online${serverName ? ` on ${serverName}` : ''}` : 'offline' }}</span>
    </span>
    <span v-if="serverName" class="ml-auto min-w-0 truncate text-sm text-[var(--mc-gray)]" aria-hidden="true">{{ serverName }}</span>
    <span v-if="$slots.default" class="shrink-0" :class="{ 'ml-auto': !serverName }"><slot /></span>
  </li>
</template>

<script setup lang="ts">
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';

// One line of the Tab-style player list: status pixel, head, name, server.
// Used by the friends list and the party panel so a player looks the same in both.
const props = defineProps<{
  player: NetworkPlayerInterface,
  you?: boolean,
}>();

const { byShortName } = useServerStore();
const serverName = computed(() =>
  props.player.server ? (byShortName(props.player.server)?.displayName ?? props.player.server) : null,
);
</script>
