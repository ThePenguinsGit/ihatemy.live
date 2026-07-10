import type ServerStatusInterface from '~/interfaces/ServerStatusInterface';

export const useServer = (
  shortName: MaybeRefOrGetter<string>,
): ComputedRef<ServerStatusInterface | undefined> => {
  const store = useServerStore();
  return computed(() => store.byShortName(toValue(shortName)));
};
