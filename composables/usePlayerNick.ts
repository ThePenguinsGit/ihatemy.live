import type MiniMessageNickResponseInterface from '~/interfaces/MiniMessageNickResponseInterface';
import { nickSegments, type NickSegment } from '~/utils/nickRender';

// The linked player's nickname as styled segments, for places that show the
// name the way it looks in game, like the cosmetics previews. Shared under one
// key so NickSetting can refresh it after saving a new nick.
export const PLAYER_NICK_KEY = 'player-nick';

export const usePlayerNick = () => {
  const { user } = useUserSession();
  const uuid = computed(() => user.value?.minecraftUuid ?? '');

  const { data, status } = useAsyncData<MiniMessageNickResponseInterface | null>(
    PLAYER_NICK_KEY,
    async () => {
      if (!uuid.value) return null;
      try {
        return await $fetch<MiniMessageNickResponseInterface>('/api/nick', { query: { uuid: uuid.value } });
      } catch {
        return null;
      }
    },
    { server: false, default: () => null, watch: [uuid] },
  );

  // Rendered here from `miniMessage` like the nick editor does. (`rendered` in
  // the response is only the rank prefix.) Empty when there's no nick.
  const segments = computed<NickSegment[]>(() => {
    const source = data.value?.miniMessage?.trim();
    return source ? nickSegments(parseMiniMessage(source)) : [];
  });

  // Until the first answer, callers show a placeholder rather than a name that
  // gets swapped out a moment later.
  const settled = computed(() => status.value === 'success' || status.value === 'error');

  return { segments, settled };
};
