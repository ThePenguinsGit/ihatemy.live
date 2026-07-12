import { ServerStatusEnum } from '~/Enum/ServerStatusEnum';
import type ServerStatusInterface from '~/interfaces/ServerStatusInterface';

export const useServerStore = defineStore('servers', () => {
  const asyncData = useAsyncData<ServerStatusInterface[] | null>(
    'all-servers',
    () => $fetch<ServerStatusInterface[]>('/api/all-servers'),
    { default: () => null },
  );

  const servers = asyncData.data;

  const aliveServers = computed(
    () => servers.value?.filter((s) => s.status !== ServerStatusEnum.KILLED) ?? null,
  );

  const ready = async (): Promise<void> => {
    if (!servers.value) await asyncData;
  };

  const refresh = (): Promise<void> => asyncData.refresh();

  const byShortName = (shortName: string): ServerStatusInterface | undefined =>
    servers.value?.find((s) => s.shortName === shortName);

  return { servers, aliveServers, ready, refresh, byShortName };
});
