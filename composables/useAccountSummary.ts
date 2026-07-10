import type PenguBotResponseInterface from '~/interfaces/PenguBotResponseInterface';
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';

type Summary = PenguBotResponseInterface<PlayTimeResultInterface> | null;

// The logged-in user's playtime profile, shared app-wide (header + page) and
// deduped via useAsyncData's key.
//
// Auth rides the sealed session cookie: the /api proxy injects the PenguBot JWT
// server-side, so these calls need no Authorization header and work during SSR
// (the session cookie is forwarded). The watch on `loggedIn` re-runs the fetch
// after a client-side login/logout.
export const useAccountSummary = () => {
  const { loggedIn, user } = useUserSession();

  const fetchSummary = async (): Promise<Summary> => {
    if (!user.value?.minecraftUuid) return null;
    try {
      return await $fetch<PenguBotResponseInterface<PlayTimeResultInterface>>(
        '/api/player-profile',
        { query: { uuid: user.value.minecraftUuid } },
      );
    } catch {
      return null;
    }
  };

  const { data: summary, refresh } = useAsyncData<Summary>(
    'account-summary',
    fetchSummary,
    {
      default: (): Summary => null,
      watch: [() => loggedIn.value],
    },
  );

  return { summary, refresh };
};
