import { SOCIAL_ACTIONS, isMissingEndpoint, socialErrorMessage } from '~/utils/socialActions';
import type { SocialActionName, SocialActionTarget } from '~/utils/socialActions';

export type SocialActionResult =
  | { ok: true }
  // The endpoint isn't live yet: show the in-game command instead of an error.
  | { ok: false, fallback: string }
  | { ok: false, error: string };

// Runs a friend/party action against the endpoints in utils/socialActions.ts
// and puts what it answered with straight into the social state, rather than
// fetching again (which could come back from before the change). Callers do
// their own optimistic hiding and undo it on a non-ok result.
export const useSocialActions = () => {
  const { party, invites, apply } = useSocial();

  const run = async (name: SocialActionName, target: SocialActionTarget): Promise<SocialActionResult> => {
    const action = SOCIAL_ACTIONS[name];
    // The website can't do it: point at the game, or say so if the game can't either.
    const unavailable = (): SocialActionResult => {
      const command = action.command(target);
      return command ? { ok: false, fallback: command } : { ok: false, error: socialErrorMessage(undefined, name) };
    };
    try {
      const data = await $fetch(`/api${action.path}`, { method: 'POST', body: action.body(target) });
      apply(data);
      // Leaving answers with the invites only, so the party has to be cleared
      // here; accepting clears the user's other invites server-side.
      if (name === 'leaveParty') party.value = null;
      if (name === 'acceptPartyInvite') invites.value = [];
      return { ok: true };
    } catch (error) {
      const { status, data } = (error ?? {}) as { status?: number, data?: unknown };
      if (isMissingEndpoint(status, data)) return unavailable();
      const code = data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : undefined;
      return { ok: false, error: socialErrorMessage(code, name) };
    }
  };

  return { run };
};
