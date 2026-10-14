<template>
  <template v-if="visible.length">
    <h3 class="text-base !text-secondaryLight">Waiting for an answer</h3>
    <ul class="tab-list">
      <template v-for="player in visible" :key="player.uuid">
        <SocialPlayerRow :player="player">
          <button
            type="button"
            class="text-sm underline underline-offset-2 text-white/75 hover:text-white cursor-pointer"
            :disabled="busy.has(player.uuid)"
            :aria-label="`Cancel ${label} to ${player.displayName ?? player.name ?? 'this player'}`"
            @click="cancel(player)"
          >Cancel</button>
        </SocialPlayerRow>
        <li v-if="notes[player.uuid]" class="px-3 pb-2 text-white/85 normal-case">
          <SocialFallbackNote v-if="notes[player.uuid]!.fallback" :command="notes[player.uuid]!.fallback!" />
          <p v-else role="alert" class="text-sm">{{ notes[player.uuid]!.error }}</p>
        </li>
      </template>
    </ul>
  </template>
</template>

<script setup lang="ts">
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';
import { friendKey, partyInviteeKey } from '~/composables/useSocial';

// Requests or invites you sent that nobody answered yet, each with a Cancel.
// Shared by the friends list (friend requests) and the party panel (invites).
const props = defineProps<{
  players: NetworkPlayerInterface[],
  action: 'cancelFriendRequest' | 'cancelPartyInvite',
}>();

const { hidden, hide, unhide } = useSocial();
const { run } = useSocialActions();

const label = computed(() => (props.action === 'cancelFriendRequest' ? 'friend request' : 'party invite'));
const keyOf = (player: NetworkPlayerInterface) =>
  props.action === 'cancelFriendRequest' ? friendKey('sent', player) : partyInviteeKey(player);

// Rows hide while their cancel runs, and come back with a note if it fails.
const visible = computed(() => props.players.filter(p => !hidden.value.includes(keyOf(p))));

const busy = ref(new Set<string>());
const notes = ref<Record<string, { fallback?: string, error?: string }>>({});

const cancel = async (player: NetworkPlayerInterface) => {
  const key = keyOf(player);
  busy.value.add(player.uuid);
  delete notes.value[player.uuid];
  hide(key);
  const result = await run(props.action, { kind: 'player', player });
  unhide(key);
  busy.value.delete(player.uuid);
  if (result.ok) return;
  notes.value[player.uuid] = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
};
</script>
