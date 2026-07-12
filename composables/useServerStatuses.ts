import type McStatsResultInterface from '~/interfaces/McStatsResultInterface';

type StatusMap = Record<string, McStatsResultInterface | null>;

export const useServerStatuses = (refreshMs = 10000) => {
  const config = useRuntimeConfig();
  const serverStore = useServerStore();

  const fetchAll = async (): Promise<StatusMap> => {
    await serverStore.ready();
    const hostnames = serverStore.aliveServers?.map((s) => s.shortName) ?? [];
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
