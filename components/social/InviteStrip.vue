<template>
  <div v-if="entries.length || undoable.length" aria-live="polite" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
    <SocialInviteToast
      v-for="entry in entries"
      :key="entry.key"
      :kind="entry.kind"
      :from="entry.from"
      :created-at="entry.createdAt"
      :busy="busy.has(entry.key)"
      :blocked-reason="entry.kind === 'party' && party ? 'Leave your party first' : undefined"
      :note="notes[entry.key]"
      @accept="accept(entry)"
      @decline="decline(entry)"
    />

    <!-- A declined toast leaves this behind for a few seconds before it's sent -->
    <div
      v-for="pending in undoable"
      :key="`undo-${pending.key}`"
      class="flex items-center justify-between gap-3 px-3 py-2 text-white/85 bg-secondary/70 border-2 border-dashed border-ink"
    >
      <span>Declined {{ pending.name }}.</span>
      <PixelButton class="!py-1 !px-3 text-sm" @click="undo(pending.key)">Undo</PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';
import type { PartyInviteInterface } from '~/interfaces/PartyInterface';
import type { SocialActionResult } from '~/composables/useSocialActions';

// Everything waiting on your answer: incoming friend requests (oldest first)
// and party invites (newest first), as toasts. Accept fires right away; Decline
// waits 5 seconds with an Undo, since it's the easy one to fat-finger.
const UNDO_MS = 5000;

type Entry =
  | { key: string, kind: 'friend', from: NetworkPlayerInterface, createdAt?: undefined, player: NetworkPlayerInterface }
  | { key: string, kind: 'party', from: NetworkPlayerInterface, createdAt: string, invite: PartyInviteInterface };

const { requests, openInvites, party, hide, unhide } = useSocial();
const { run } = useSocialActions();

const entries = computed<Entry[]>(() => [
  ...openInvites.value.map(invite => ({
    key: inviteKey(invite), kind: 'party' as const, from: invite.invitedBy, createdAt: invite.createdAt, invite,
  })),
  ...requests.value.map(player => ({
    key: friendKey('request', player), kind: 'friend' as const, from: player, player,
  })),
]);

const busy = ref(new Set<string>());
const notes = ref<Record<string, { fallback?: string, error?: string }>>({});
const undoTimers = new Map<string, { timer: ReturnType<typeof setTimeout>, entry: Entry }>();
const undoable = ref<{ key: string, name: string }[]>([]);

const target = (entry: Entry) => entry.kind === 'friend'
  ? { kind: 'player' as const, player: entry.player }
  : { kind: 'invite' as const, invite: entry.invite };

// The toast is hidden while the call runs; it comes back with a note if the
// endpoint isn't there yet or the server refused.
const settle = (key: string, result: SocialActionResult) => {
  busy.value.delete(key);
  if (result.ok) {
    // run() already put the answer into the lists; forget the key so
    // a later request from the same player isn't hidden.
    unhide(key);
    return;
  }
  notes.value[key] = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
  unhide(key);
};

const accept = async (entry: Entry) => {
  busy.value.add(entry.key);
  delete notes.value[entry.key];
  hide(entry.key);
  settle(entry.key, await run(entry.kind === 'friend' ? 'acceptFriend' : 'acceptPartyInvite', target(entry)));
};

const sendDecline = (entry: Entry) =>
  run(entry.kind === 'friend' ? 'declineFriend' : 'declinePartyInvite', target(entry));

const decline = (entry: Entry) => {
  delete notes.value[entry.key];
  hide(entry.key);
  undoable.value.push({ key: entry.key, name: entry.from.displayName ?? entry.from.name ?? 'them' });
  const timer = setTimeout(async () => {
    undoTimers.delete(entry.key);
    undoable.value = undoable.value.filter(u => u.key !== entry.key);
    busy.value.add(entry.key);
    settle(entry.key, await sendDecline(entry));
  }, UNDO_MS);
  undoTimers.set(entry.key, { timer, entry });
};

const undo = (key: string) => {
  clearTimeout(undoTimers.get(key)?.timer);
  undoTimers.delete(key);
  undoable.value = undoable.value.filter(u => u.key !== key);
  unhide(key);
};

// Leaving the page mid-undo sends the decline rather than dropping it silently.
onBeforeUnmount(() => {
  for (const { timer, entry } of undoTimers.values()) {
    clearTimeout(timer);
    sendDecline(entry);
  }
});
</script>
