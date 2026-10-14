import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SOCIAL_ACTIONS, isMissingEndpoint, socialErrorMessage } from '~/utils/socialActions';
import type NetworkPlayerInterface from '~/interfaces/NetworkPlayerInterface';

const steve: NetworkPlayerInterface = { uuid: 'u-1', name: 'Steve', displayName: 'Steve', online: true, server: 'atm10' };
const ghost: NetworkPlayerInterface = { uuid: 'u-2', name: null, displayName: null, online: false, server: null };

test('a bare 404, 405 or 501 means the endpoint is not there yet', () => {
  assert.equal(isMissingEndpoint(404, 'Not Found'), true);
  assert.equal(isMissingEndpoint(404, undefined), true);
  assert.equal(isMissingEndpoint(405, undefined), true);
  assert.equal(isMissingEndpoint(501, undefined), true);
});

test('a 404 with a JSON error is a real refusal', () => {
  assert.equal(isMissingEndpoint(404, { error: 'not_found' }), false);
  assert.equal(isMissingEndpoint(409, { error: 'expired' }), false);
  assert.equal(isMissingEndpoint(500, undefined), false);
});

test('friend actions hit /user/friends/{accept|deny} with friendUuid', () => {
  const target = { kind: 'player' as const, player: steve };
  assert.equal(SOCIAL_ACTIONS.acceptFriend.path, '/user/friends/accept');
  assert.equal(SOCIAL_ACTIONS.declineFriend.path, '/user/friends/deny');
  assert.deepEqual(SOCIAL_ACTIONS.acceptFriend.body(target), { friendUuid: 'u-1' });
  assert.equal(SOCIAL_ACTIONS.acceptFriend.command(target), '/friend accept Steve');
  assert.equal(SOCIAL_ACTIONS.declineFriend.command({ kind: 'player', player: ghost }), '/friend deny u-2');
});

test('party invite actions hit /user/party/{accept|decline} with the party id', () => {
  const invite = { partyId: 'p-9', player: steve, invitedBy: ghost, createdAt: '2026-10-13T12:00:00Z' };
  assert.equal(SOCIAL_ACTIONS.acceptPartyInvite.path, '/user/party/accept');
  assert.equal(SOCIAL_ACTIONS.declinePartyInvite.path, '/user/party/decline');
  assert.deepEqual(SOCIAL_ACTIONS.acceptPartyInvite.body({ kind: 'invite', invite }), { partyId: 'p-9' });
  assert.equal(SOCIAL_ACTIONS.declinePartyInvite.command({ kind: 'invite', invite }), '/party decline');
});

test('cancel, remove and leave hit their endpoints', () => {
  const target = { kind: 'player' as const, player: steve };
  assert.equal(SOCIAL_ACTIONS.cancelFriendRequest.path, '/user/friends/cancel');
  assert.equal(SOCIAL_ACTIONS.removeFriend.path, '/user/friends/remove');
  assert.equal(SOCIAL_ACTIONS.leaveParty.path, '/user/party/leave');
  assert.deepEqual(SOCIAL_ACTIONS.removeFriend.body(target), { friendUuid: 'u-1' });
  assert.equal(SOCIAL_ACTIONS.cancelFriendRequest.command(target), null);
  assert.equal(SOCIAL_ACTIONS.removeFriend.command(target), '/friend remove Steve');
  assert.equal(SOCIAL_ACTIONS.leaveParty.body({ kind: 'none' }), undefined);
});

test('add and invite take a typed name or a known player', () => {
  const typed = { kind: 'name' as const, name: 'Alex' };
  assert.deepEqual(SOCIAL_ACTIONS.addFriend.body(typed), { friendName: 'Alex' });
  assert.deepEqual(SOCIAL_ACTIONS.inviteToParty.body(typed), { inviteeName: 'Alex' });
  assert.deepEqual(SOCIAL_ACTIONS.inviteToParty.body({ kind: 'player', player: steve }), { inviteeUuid: 'u-1' });
  assert.equal(SOCIAL_ACTIONS.addFriend.command(typed), '/friend add Alex');
  assert.equal(SOCIAL_ACTIONS.inviteToParty.command({ kind: 'player', player: ghost }), '/party invite u-2');
  assert.equal(SOCIAL_ACTIONS.createParty.path, '/user/party/create');
});

test('not_found reads differently for a typed name than for an answer', () => {
  assert.match(socialErrorMessage('not_found', 'addFriend'), /Nobody by that name/);
  assert.match(socialErrorMessage('not_found', 'acceptFriend'), /gone already/);
  assert.match(socialErrorMessage('already_member', 'inviteToParty'), /already in your party/);
  assert.match(socialErrorMessage('not_found', 'kickFromParty'), /not in your party/);
});

test('kick names the member by uuid and has no in-game command', () => {
  assert.equal(SOCIAL_ACTIONS.kickFromParty.path, '/user/party/kick');
  assert.deepEqual(SOCIAL_ACTIONS.kickFromParty.body({ kind: 'player', player: steve }), { memberUuid: 'u-1' });
  assert.equal(SOCIAL_ACTIONS.kickFromParty.command({ kind: 'player', player: steve }), null);
});

test('cancelling a party invite names the invitee and has no in-game command', () => {
  assert.equal(SOCIAL_ACTIONS.cancelPartyInvite.path, '/user/party/cancel');
  assert.deepEqual(SOCIAL_ACTIONS.cancelPartyInvite.body({ kind: 'player', player: steve }), { inviteeUuid: 'u-1' });
  assert.equal(SOCIAL_ACTIONS.cancelPartyInvite.command({ kind: 'player', player: steve }), null);
});
