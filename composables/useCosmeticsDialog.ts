import type { CosmeticType } from '~/interfaces/CosmeticItemInterface';
import { cosmeticSlug, cosmeticTypeFromSlug } from '~/utils/cosmetics';

// Open state of the cosmetics dialog lives in the URL (?cosmetics=badge), so
// docs pages, Discord or the login pitch can link straight into a tab. Opening
// and closing replace the history entry rather than pushing one.
export const useCosmeticsDialog = () => {
  const route = useRoute();
  const router = useRouter();

  const requested = computed(() => route.query.cosmetics !== undefined);
  // The tab asked for; an unknown or empty slug falls back to badges.
  const type = computed<CosmeticType>(() => cosmeticTypeFromSlug(route.query.cosmetics) ?? 'BADGE');

  const open = (to: CosmeticType = 'BADGE') =>
    router.replace({ query: { ...route.query, cosmetics: cosmeticSlug(to) } });

  const close = () => {
    const { cosmetics: _, ...query } = route.query;
    return router.replace({ query });
  };

  return { requested, type, open, close };
};
