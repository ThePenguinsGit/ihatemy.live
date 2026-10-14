import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';
import type { PartyInviteInterface } from '~/interfaces/PartyInterface';

// Friend and party actions, as openapi.yaml describes them. Each one also
// names the in-game command that does the same thing, which the UI offers
// when the endpoint turns out to be missing (a bare 404/405/501).
export type SocialActionName =
  | 'addFriend'
  | 'acceptFriend'
  | 'declineFriend'
  | 'cancelFriendRequest'
  | 'removeFriend'
  | 'createParty'
  | 'inviteToParty'
  | 'cancelPartyInvite'
  | 'kickFromParty'
  | 'acceptPartyInvite'
  | 'declinePartyInvite'
  | 'leaveParty';

export type SocialActionTarget =
  | { kind: 'player', player: NetworkPlayerInterface }
  // A name typed into a form, for players that aren't in any of our lists.
  | { kind: 'name', name: string }
  | { kind: 'invite', invite: PartyInviteInterface }
  | { kind: 'none' };

interface SocialActionDefinition {
  path: string,
  body: (target: SocialActionTarget) => Record<string, string> | undefined,
  // Null when the game has no command for it either.
  command: (target: SocialActionTarget) => string | null,
}

const playerOf = (target: SocialActionTarget) => {
  if (target.kind !== 'player') throw new Error('This action needs a player');
  return target.player;
};
const inviteOf = (target: SocialActionTarget) => {
  if (target.kind !== 'invite') throw new Error('This action needs a party invite');
  return target.invite;
};

// What to type in game for a player: their name, or the uuid if we never saw one.
export const commandName = (player: NetworkPlayerInterface): string => player.name ?? player.uuid;

// The add/remove/cancel/invite/kick endpoints take a uuid or a name, under a
// prefix (`friend`, `invitee` or `member`), so a known player and a typed name both work.
const nameOrUuid = (prefix: string) => (target: SocialActionTarget): Record<string, string> => {
  if (target.kind === 'name') return { [`${prefix}Name`]: target.name };
  return { [`${prefix}Uuid`]: playerOf(target).uuid };
};
const targetName = (target: SocialActionTarget): string =>
  target.kind === 'name' ? target.name : commandName(playerOf(target));

export const SOCIAL_ACTIONS: Record<SocialActionName, SocialActionDefinition> = {
  addFriend: {
    path: '/user/friends/add',
    body: nameOrUuid('friend'),
    command: t => `/friend add ${targetName(t)}`,
  },
  acceptFriend: {
    path: '/user/friends/accept',
    body: t => ({ friendUuid: playerOf(t).uuid }),
    command: t => `/friend accept ${commandName(playerOf(t))}`,
  },
  declineFriend: {
    path: '/user/friends/deny',
    body: t => ({ friendUuid: playerOf(t).uuid }),
    command: t => `/friend deny ${commandName(playerOf(t))}`,
  },
  // The game has no way to take a request back.
  cancelFriendRequest: {
    path: '/user/friends/cancel',
    body: nameOrUuid('friend'),
    command: () => null,
  },
  removeFriend: {
    path: '/user/friends/remove',
    body: nameOrUuid('friend'),
    command: t => `/friend remove ${targetName(t)}`,
  },
  createParty: {
    path: '/user/party/create',
    body: () => undefined,
    command: () => '/party create',
  },
  // Makes a party first when the user is in none, like the command does.
  inviteToParty: {
    path: '/user/party/invite',
    body: nameOrUuid('invitee'),
    command: t => `/party invite ${targetName(t)}`,
  },
  // The game has no command for this one.
  cancelPartyInvite: {
    path: '/user/party/cancel',
    body: nameOrUuid('invitee'),
    command: () => null,
  },
  // Nor for this one.
  kickFromParty: {
    path: '/user/party/kick',
    body: nameOrUuid('member'),
    command: () => null,
  },
  acceptPartyInvite: {
    path: '/user/party/accept',
    body: t => ({ partyId: inviteOf(t).partyId }),
    command: () => '/party accept',
  },
  declinePartyInvite: {
    path: '/user/party/decline',
    body: t => ({ partyId: inviteOf(t).partyId }),
    command: () => '/party decline',
  },
  leaveParty: {
    path: '/user/party/leave',
    body: () => undefined,
    command: () => '/party leave',
  },
};

// Whether a failed call means "this endpoint doesn't exist yet" rather than a
// real refusal. The backend answers real refusals with a JSON `{error}` body
// (like the cosmetics endpoints do), so a bare 404/405/501 is a missing route.
export const isMissingEndpoint = (status: number | undefined, data: unknown): boolean => {
  if (status === 405 || status === 501) return true;
  if (status !== 404) return false;
  return !(data && typeof data === 'object' && 'error' in data);
};

// The refusal codes the friend/party endpoints answer with, as a line for the
// UI. `not_found` means a different thing for actions that name a player by
// hand (nobody by that name) than for answering a request (it's gone).
export const socialErrorMessage = (code: string | undefined, action?: SocialActionName): string => {
  switch (code) {
    case 'not_found':
      if (action === 'addFriend' || action === 'inviteToParty') return "Nobody by that name has played here yet, check the spelling!";
      if (action === 'leaveParty') return "You're not in a party anymore.";
      if (action === 'kickFromParty') return "They're not in your party anymore.";
      return "That's gone already, someone was faster.";
    case 'already_in_party':
      return 'Leave your party first!';
    case 'friend_limit':
      return "One of you already has as many friends as allowed, time for a cleanup!";
    case 'already_friends':
      return "You're already friends!";
    case 'already_sent':
      return 'You already asked them, give them a moment to answer.';
    case 'already_invited':
      return "They're invited already, now they just have to say yes.";
    case 'already_member':
      return "They're already in your party!";
    case 'friend_missing':
    case 'invitee_missing':
    case 'member_missing':
      return 'Type a name first!';
    default:
      return "That didn't work, the server said no. Try again in a bit!";
  }
};
