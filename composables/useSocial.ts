import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';
import type PartyInterface from '~/interfaces/PartyInterface';
import type { PartyInviteInterface } from '~/interfaces/PartyInterface';

type FriendsResponse = {
  friends: NetworkPlayerInterface[],
  requests: NetworkPlayerInterface[],
  sent: NetworkPlayerInterface[],
};

const POLL_MS = 30_000;

// Keys for requests/invites the UI has already acted on (or is about to, during
// a decline's undo window). Polls keep returning them until the backend catches
// up, so they're filtered out here instead of flickering back in.
export const friendKey = (kind: 'friend' | 'request' | 'sent', player: NetworkPlayerInterface) => `${kind}:${player.uuid}`;
export const inviteKey = (invite: PartyInviteInterface) => `invite:${invite.partyId}`;
// An invite your party sent, keyed by who it went to.
export const partyInviteeKey = (player: NetworkPlayerInterface) => `invitee:${player.uuid}`;

let subscribers = 0;
let timer: ReturnType<typeof setInterval> | undefined;
// Every component using this registers the login watch below, so concurrent
// refreshes share one round of requests.
let inFlight: Promise<void> | null = null;
// Bumped whenever an action's answer is applied, so a poll that started before
// it can't land afterwards and put the old state back.
let generation = 0;

// Friends, friend requests, the party and party invites for the linked user.
// Shared app-wide (header badge + home page) and refreshed every 30s while at
// least one component is mounted and the tab is visible.
export const useSocial = () => {
  const { user } = useUserSession();

  const friends = useState<FriendsResponse | null>('social-friends', () => null);
  const party = useState<PartyInterface | null | undefined>('social-party', () => undefined);
  const invites = useState<PartyInviteInterface[] | null>('social-invites', () => null);
  const hidden = useState<string[]>('social-hidden', () => []);

  const load = async () => {
    const started = generation;
    const [f, p, i] = await Promise.allSettled([
      $fetch<FriendsResponse>('/api/user/friends'),
      $fetch<{ party: PartyInterface | null }>('/api/user/party'),
      $fetch<{ invites: PartyInviteInterface[] }>('/api/user/party/invites'),
    ]);
    if (started !== generation) return;
    if (f.status === 'fulfilled') friends.value = f.value;
    if (p.status === 'fulfilled') party.value = p.value.party;
    if (i.status === 'fulfilled') invites.value = i.value.invites;
  };

  const refresh = (): Promise<void> => {
    if (!user.value?.minecraftUuid) return Promise.resolve();
    inFlight ??= load().finally(() => { inFlight = null; });
    return inFlight;
  };

  // Takes the state an action answered with: every friend action answers with
  // the friend lists, party actions with the party or the invites to the user.
  const apply = (data: unknown) => {
    if (!data || typeof data !== 'object') return;
    generation++;
    if ('friends' in data) friends.value = data as FriendsResponse;
    if ('party' in data) party.value = (data as { party: PartyInterface | null }).party;
    if ('invites' in data) invites.value = (data as { invites: PartyInviteInterface[] }).invites;
  };

  const hide = (key: string) => { if (!hidden.value.includes(key)) hidden.value = [...hidden.value, key]; };
  const unhide = (key: string) => { hidden.value = hidden.value.filter(k => k !== key); };

  const friendList = computed(() => friends.value?.friends.filter(p => !hidden.value.includes(friendKey('friend', p))) ?? []);
  const requests = computed(() => friends.value?.requests.filter(p => !hidden.value.includes(friendKey('request', p))) ?? []);
  const sent = computed(() => friends.value?.sent.filter(p => !hidden.value.includes(friendKey('sent', p))) ?? []);
  const openInvites = computed(() => invites.value?.filter(i => !hidden.value.includes(inviteKey(i))) ?? []);
  // What the header badge counts: things waiting on an answer from the user.
  const pendingCount = computed(() => requests.value.length + openInvites.value.length);

  const tick = () => { if (document.visibilityState === 'visible') refresh(); };

  onMounted(() => {
    if (subscribers++ === 0) {
      refresh();
      timer = setInterval(tick, POLL_MS);
      document.addEventListener('visibilitychange', tick);
    }
  });
  onBeforeUnmount(() => {
    if (--subscribers === 0) {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    }
  });

  // Logging in or linking mid-session: fetch right away rather than on the next tick.
  watch(() => user.value?.minecraftUuid, (uuid) => {
    if (uuid) refresh();
    else { friends.value = null; party.value = undefined; invites.value = null; }
  });

  return { friends, friendList, party, invites, hidden, requests, sent, openInvites, pendingCount, refresh, apply, hide, unhide };
};
