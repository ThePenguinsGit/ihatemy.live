<template>
  <Card variant="panel" class="flex flex-col gap-3">
    <div class="flex items-baseline justify-between gap-2">
      <h2 class="text-xl">Party</h2>
      <i v-if="party"><span v-if="party.members.length > 1">{{ party.members.length }} in your party</span><span v-else>Just you</span></i>
      <i v-else-if="party === undefined">Loading…</i>
    </div>

    <template v-if="party">
      <!-- Heads overlap like a group photo -->
      <div class="flex pl-2" aria-hidden="true">
        <McHead
          v-for="member in party.members.slice(0, 8)"
          :key="member.uuid"
          :uuid="member.uuid"
          alt=""
          class="w-9 h-9 -ml-2 border-2 border-ink"
        />
      </div>

      <ul class="tab-list">
        <template v-for="member in party.members" :key="member.uuid">
          <SocialPlayerRow :player="member" :you="member.uuid === user?.minecraftUuid">
            <template v-if="member.uuid !== user?.minecraftUuid">
              <span v-if="confirmKick === member.uuid" class="flex items-center gap-2 text-sm">
                <span class="font-[minecraft]">Kick?</span>
                <button type="button" class="row-action !text-ded" :disabled="kicking.has(member.uuid)" @click="kick(member)">Yes</button>
                <button type="button" class="row-action" @click="confirmKick = null">No</button>
              </span>
              <button
                v-else
                type="button"
                class="row-action reveal"
                :aria-label="`Kick ${member.displayName ?? member.name ?? 'this player'} from your party`"
                @click="confirmKick = member.uuid"
              >Kick</button>
            </template>
          </SocialPlayerRow>
          <li v-if="kickNotes[member.uuid]" class="px-3 pb-2 text-white/85 normal-case">
            <p role="alert" class="text-sm">{{ kickNotes[member.uuid] }}</p>
          </li>
        </template>
      </ul>

      <SocialPendingList :players="pendingOut.map(i => i.player)" action="cancelPartyInvite" />

      <template v-if="invitable.length">
        <h3 class="text-base !text-secondaryLight">Invite friends</h3>
        <ul class="tab-list">
          <template v-for="friend in invitable" :key="friend.uuid">
            <SocialPlayerRow :player="friend">
              <button
                type="button"
                class="row-action"
                :disabled="inviting.has(friend.uuid)"
                :aria-label="`Invite ${friend.displayName ?? friend.name ?? 'this player'} to your party`"
                @click="invite(friend)"
              >{{ inviting.has(friend.uuid) ? 'Inviting…' : 'Invite' }}</button>
            </SocialPlayerRow>
            <li v-if="inviteNotes[friend.uuid]" class="px-3 pb-2 text-white/85 normal-case">
              <SocialFallbackNote v-if="inviteNotes[friend.uuid]!.fallback" :command="inviteNotes[friend.uuid]!.fallback!" />
              <p v-else role="alert" class="text-sm">{{ inviteNotes[friend.uuid]!.error }}</p>
            </li>
          </template>
        </ul>
      </template>

      <SocialNameForm
        action="inviteToParty"
        label="Invite someone"
        placeholder="Their Minecraft name"
        submit-label="Invite"
        busy-label="Inviting…"
        :success-text="inviteSent"
      />

      <div class="flex flex-col items-end gap-2 mt-auto">
        <div v-if="confirmLeave" class="flex items-center gap-2">
          <span class="font-[minecraft] text-sm">Leave party?</span>
          <PixelButton danger class="!py-1 text-sm" :disabled="leaving" @click="leave">Leave</PixelButton>
          <PixelButton class="!py-1 text-sm" :disabled="leaving" @click="confirmLeave = false">Stay</PixelButton>
        </div>
        <PixelButton v-else danger class="!py-1 text-sm" @click="confirmLeave = true">Leave</PixelButton>
        <div v-if="note" class="text-right">
          <SocialFallbackNote v-if="note.fallback" :command="note.fallback" />
          <p v-else role="alert" class="text-sm text-ded">{{ note.error }}</p>
        </div>
      </div>
    </template>

    <ul v-else-if="party === undefined" class="tab-list" aria-hidden="true">
      <li v-for="i in 3" :key="i" class="px-3 py-2"><Loading width="8em" /></li>
    </ul>

    <template v-else>
      <p>Nothing to see yet.</p>
      <div class="flex flex-col items-start gap-2">
        <PixelButton primary class="!py-1 text-sm" :disabled="creating" @click="create">
          {{ creating ? 'Starting…' : 'Start a party' }}
        </PixelButton>
        <div v-if="createNote">
          <SocialFallbackNote v-if="createNote.fallback" :command="createNote.fallback" />
          <p v-else role="alert" class="text-sm text-ded">{{ createNote.error }}</p>
        </div>
      </div>
      <SocialNameForm
        v-if="party"
        action="inviteToParty"
        class="mt-auto"
        label="Invite someone"
        placeholder="Their Minecraft name"
        submit-label="Invite"
        busy-label="Inviting…"
        :success-text="inviteSent"
      />
    </template>
  </Card>
</template>

<script setup lang="ts">
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';

// The party you're in: members in join order, the invites it has out, ways to
// invite more people, and a way to leave. With no party, a way to start one.
// `party` is undefined while loading and null with no party.
const { user } = useUserSession();
const { party, friendList } = useSocial();
const { run } = useSocialActions();

// Invites stay open until answered or the party ends, oldest first.
const pendingOut = computed(() => party.value?.invites ?? []);

// Friends who aren't in the party and have no invite out, online ones first
// (the API's order). Offline friends get the invite next time they're on.
const invitable = computed(() => {
  if (!party.value) return [];
  const taken = new Set([
    ...party.value.members.map(m => m.uuid),
    ...pendingOut.value.map(i => i.player.uuid),
  ]);
  return friendList.value.filter(f => !taken.has(f.uuid));
});

const inviteSent = (name: string) => `Invited ${name}! Now they just have to say yes.`;

const inviting = ref(new Set<string>());
const inviteNotes = ref<Record<string, { fallback?: string, error?: string }>>({});
const invite = async (friend: NetworkPlayerInterface) => {
  inviting.value.add(friend.uuid);
  delete inviteNotes.value[friend.uuid];
  const result = await run('inviteToParty', { kind: 'player', player: friend });
  inviting.value.delete(friend.uuid);
  if (!result.ok) inviteNotes.value[friend.uuid] = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
};

// The member whose Kick is waiting on a yes. The game has no kick command, so a
// failure only ever shows an error.
const confirmKick = ref<string | null>(null);
const kicking = ref(new Set<string>());
const kickNotes = ref<Record<string, string>>({});
const kick = async (member: NetworkPlayerInterface) => {
  confirmKick.value = null;
  kicking.value.add(member.uuid);
  delete kickNotes.value[member.uuid];
  const result = await run('kickFromParty', { kind: 'player', player: member });
  kicking.value.delete(member.uuid);
  if (!result.ok) kickNotes.value[member.uuid] = 'error' in result ? result.error : socialErrorMessage(undefined);
};

const creating = ref(false);
const createNote = ref<{ fallback?: string, error?: string } | null>(null);
const create = async () => {
  creating.value = true;
  createNote.value = null;
  const result = await run('createParty', { kind: 'none' });
  creating.value = false;
  if (!result.ok) createNote.value = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
};

const confirmLeave = ref(false);
const leaving = ref(false);
const note = ref<{ fallback?: string, error?: string } | null>(null);

const leave = async () => {
  leaving.value = true;
  note.value = null;
  const result = await run('leaveParty', { kind: 'none' });
  leaving.value = false;
  confirmLeave.value = false;
  if (!result.ok) note.value = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
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

/* Kick only shows on the row you're pointing at, like Remove on friends. */
@media (hover: hover) {
  .reveal { opacity: 0; }
  li:hover .reveal, .reveal:focus-visible { opacity: 1; }
}
</style>
