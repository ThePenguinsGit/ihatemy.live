import type McStatsResultInterface from '~/interfaces/McStatsResultInterface';

type StatusMap = Record<string, McStatsResultInterface | null>;

// Fetches live status for every hostname and shares it with the hero
// aggregate and the individual server cards (single source of truth).
//
// The initial load runs through useAsyncData, so it executes on the server
// during SSR and is serialized into the payload — the page ships with
// statuses already filled in (no empty flash, no refetch on hydration).
// The interval refresh then keeps them current on the client.
export const useServerStatuses = (hostnames: string[], refreshMs = 10000) => {
  const config = useRuntimeConfig();

  const fetchAll = async (): Promise<StatusMap> => {
    const entries = await Promise.all(
      hostnames.map(async (hostname) => {
        try {
          const status = await $fetch<McStatsResultInterface>(
            `${config.public.apiBaseUrl}/server-status`,
            { query: { hostname } },
          );
          return [hostname, status] as const;
        } catch {
          return [hostname, null] as const;
        }
      }),
    );
    return Object.fromEntries(entries);
  };

  const { data: statuses, refresh } = useAsyncData<StatusMap>(
    'server-statuses',
    fetchAll,
    { default: (): StatusMap => ({}) },
  );

  const onlinePlayers = computed(() =>
    Object.values(statuses.value).reduce(
      (sum, s) => sum + (s?.online ? s.players.online : 0),
      0,
    ),
  );

  const serversUp = computed(() =>
    Object.values(statuses.value).filter((s) => s?.online).length,
  );

  let interval: ReturnType<typeof setInterval>;
  onNuxtReady(() => {
    interval = setInterval(() => refresh(), refreshMs);
  });
  onBeforeUnmount(() => window.clearInterval(interval));

  return { statuses, onlinePlayers, serversUp };
};
