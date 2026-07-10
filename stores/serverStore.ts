import type ServerStatusInterface from '~/interfaces/ServerStatusInterface';

export const useServerStore = defineStore('servers', () => {
  const asyncData = useAsyncData<ServerStatusInterface[] | null>(
    'all-alive-servers',
    () => $fetch<ServerStatusInterface[]>('/api/all-alive-servers'),
    { default: () => null },
  );

  const servers = asyncData.data;

  const ready = async (): Promise<void> => {
    if (!servers.value) await asyncData;
  };

  const refresh = (): Promise<void> => asyncData.refresh();

  const byShortName = (shortName: string): ServerStatusInterface | undefined =>
    servers.value?.find((s) => s.shortName === shortName);

  return { servers, ready, refresh, byShortName };
});
