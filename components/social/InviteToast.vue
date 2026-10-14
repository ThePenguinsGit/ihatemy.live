<template>
  <div class="toast flex flex-col gap-2 p-3 text-white">
    <div class="flex items-center gap-3">
      <McHead :uuid="from.uuid" alt="" class="w-8 h-8 shrink-0 border-2 border-ink" />
      <div class="min-w-0 leading-snug">
        <p class="font-[minecraft] text-[var(--mc-yellow)] text-sm">
          {{ kind === 'friend' ? 'Friend request' : 'Party invite' }}
          <span v-if="createdAt" class="text-white/60">{{ formatAgo(now - Date.parse(createdAt)) }}</span>
        </p>
        <p class="truncate">
          {{ fromName }} {{ kind === 'friend' ? 'wants to be friends' : 'invited you to a party' }}
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <PixelButton primary class="!py-1 !px-3 text-sm" :disabled="busy || blockedReason !== undefined" @click="emit('accept')">
        {{ kind === 'friend' ? 'Accept' : 'Join party' }}
      </PixelButton>
      <PixelButton danger class="!py-1 !px-3 text-sm" :disabled="busy" @click="emit('decline')">Decline</PixelButton>
      <span v-if="blockedReason" class="text-xs text-white/70">{{ blockedReason }}</span>
    </div>

    <div v-if="note" class="text-white/85">
      <SocialFallbackNote v-if="note.fallback" :command="note.fallback" />
      <p v-else role="alert" class="text-sm">{{ note.error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';
import { formatAgo } from '~/composables/useNow';

// An advancement-toast style tile for something waiting on your answer: a
// friend request or a party invite. Neither runs out, so party invites only
// say how long ago they came in. The strip owns the actions; this only emits.
const props = defineProps<{
  kind: 'friend' | 'party',
  from: NetworkPlayerInterface,
  createdAt?: string,
  busy?: boolean,
  // Why Accept is off, e.g. already in a party.
  blockedReason?: string,
  note?: { fallback?: string, error?: string } | null,
}>();

const emit = defineEmits<{ accept: [], decline: [] }>();

const fromName = computed(() => props.from.displayName ?? props.from.name ?? 'Someone');

const now = useNow(() => !!props.createdAt, 30_000);
</script>

<style scoped>
/* The vanilla advancement toast: dark tile, light inner edge. */
.toast {
  background: var(--color-secondary);
  border: 3px solid var(--panel-border);
  box-shadow: inset 2px 2px 0 var(--panel-highlight-dark), 0 4px 0 var(--panel-drop);
}
</style>
