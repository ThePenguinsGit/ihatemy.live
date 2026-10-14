// A ticking "now" (ms) for relative times. Ticks every `intervalMs` while
// `active` is true, so nothing runs when there's nothing to show.
export const useNow = (active: MaybeRefOrGetter<boolean> = true, intervalMs = 1000) => {
  const now = ref(Date.now());
  let timer: ReturnType<typeof setInterval> | undefined;

  const stop = () => { clearInterval(timer); timer = undefined; };
  watch(() => toValue(active), (on) => {
    stop();
    if (on && import.meta.client) {
      now.value = Date.now();
      timer = setInterval(() => { now.value = Date.now(); }, intervalMs);
    }
  }, { immediate: true });
  onBeforeUnmount(stop);

  return now;
};

// "just now" / "5m ago" / "2h ago" / "3d ago" for a past time.
export const formatAgo = (ms: number): string => {
  const minutes = Math.floor(Math.max(0, ms) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};
