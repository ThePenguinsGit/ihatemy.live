<template>
  <Card variant="panel" class="flex flex-col gap-3">
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="text-xl">Friends</h2>
      <i v-if="friends"><span v-if="friendList.length > 0">{{ onlineCount }} / {{ friendList.length }} online</span></i>
      <i v-else>Loading…</i>
    </div>

    <ul v-if="friends && friendList.length" class="tab-list">
      <template v-for="friend in friendList" :key="friend.uuid">
        <SocialPlayerRow :player="friend">
          <span v-if="confirming === friend.uuid" class="flex items-center gap-2 text-sm">
            <span class="font-[minecraft]">Remove?</span>
            <button type="button" class="row-action !text-ded" :disabled="busy.has(friend.uuid)" @click="remove(friend)">Yes</button>
            <button type="button" class="row-action" @click="confirming = null">No</button>
          </span>
          <button
            v-else
            type="button"
            class="row-action reveal"
            :aria-label="`Remove ${friend.displayName ?? friend.name ?? 'this player'} from your friends`"
            @click="confirming = friend.uuid"
          >Remove</button>
        </SocialPlayerRow>
        <li v-if="notes[friend.uuid]" class="px-3 pb-2 text-white/85 normal-case">
          <SocialFallbackNote v-if="notes[friend.uuid]!.fallback" :command="notes[friend.uuid]!.fallback!" />
          <p v-else role="alert" class="text-sm">{{ notes[friend.uuid]!.error }}</p>
        </li>
      </template>
    </ul>
    <ul v-else-if="!friends" class="tab-list" aria-hidden="true">
      <li v-for="i in 4" :key="i" class="px-3 py-2"><Loading width="10em" /></li>
    </ul>
    <p v-else>No friends yet :( Add someone below!</p>

    <!-- Requests you sent that nobody answered yet -->
    <SocialPendingList :players="sent" action="cancelFriendRequest" />

    <SocialNameForm
      action="addFriend"
      class="mt-auto"
      label="Add a friend"
      placeholder="Their Minecraft name"
      submit-label="Send request"
      busy-label="Sending…"
      :success-text="name => `Sent! ${name} will see it next time they're on.`"
    />
  </Card>
</template>

<script setup lang="ts">
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';

// Your friends as a Tab player list (online first, the API's order), plus the
// requests you sent that are still open and a box to send a new one. Incoming
// requests live in the invite strip above, since they need an answer.
const { friends, friendList, sent, hide, unhide } = useSocial();
const { run } = useSocialActions();

const onlineCount = computed(() => friendList.value.filter(f => f.online).length);

const busy = ref(new Set<string>());
const notes = ref<Record<string, { fallback?: string, error?: string }>>({});
// The friend whose Remove is waiting on a yes.
const confirming = ref<string | null>(null);

// Hides the row right away, puts it back with a note if the call fails.
const remove = async (player: NetworkPlayerInterface) => {
  confirming.value = null;
  const key = friendKey('friend', player);
  busy.value.add(player.uuid);
  delete notes.value[player.uuid];
  hide(key);
  const result = await run('removeFriend', { kind: 'player', player });
  unhide(key);
  busy.value.delete(player.uuid);
  if (result.ok) return;
  notes.value[player.uuid] = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
};

</script>

<style scoped>
@reference "~/assets/css/main.css";

.row-action {
  @apply text-sm underline underline-offset-2 text-white/75 cursor-pointer;
}
.row-action:hover { @apply text-white; }
.row-action:focus-visible {
  @apply outline-2 outline-offset-2;
  outline-color: var(--focus-ring);
}

/* Remove only shows on the row you're pointing at, so the list stays a list. */
@media (hover: hover) {
  .reveal { opacity: 0; }
  li:hover .reveal, .reveal:focus-visible { opacity: 1; }
}
</style>
