import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import type { CosmeticType, SoundFileInterface } from '~/interfaces/CosmeticItemInterface';

// The four cosmetic types, in tab order. `slug` is what ?cosmetics= carries in
// the URL, so links from docs or Discord can open the dialog on a given tab.
export const COSMETIC_TYPES: { type: CosmeticType, slug: string, label: string }[] = [
  { type: 'BADGE', slug: 'badge', label: 'Badges' },
  { type: 'JOIN_MESSAGE', slug: 'join', label: 'Join' },
  { type: 'LEAVE_MESSAGE', slug: 'leave', label: 'Leave' },
  { type: 'SOUND', slug: 'sound', label: 'Sounds' },
];

// The PixelIcon each type uses where there's no rendered badge to show.
export const COSMETIC_ICONS: Record<CosmeticType, string> = {
  BADGE: 'badge',
  JOIN_MESSAGE: 'join',
  LEAVE_MESSAGE: 'logout',
  SOUND: 'sound',
};

export const cosmeticTypeFromSlug = (slug: unknown): CosmeticType | null =>
  COSMETIC_TYPES.find(t => t.slug === slug)?.type ?? null;

export const cosmeticSlug = (type: CosmeticType): string =>
  COSMETIC_TYPES.find(t => t.type === type)!.slug;

// The refusal codes POST /user/cosmetics/{action} answers with on a 409 (plus
// not_found on a 404), turned into a line the dialog can show under the button.
export const cosmeticErrorMessage = (
  code: string | undefined,
  ctx: { shortfall?: number, tokenName?: string } = {},
): string => {
  switch (code) {
    case 'not_enough_tokens':
      return ctx.shortfall && ctx.shortfall > 0
        ? `You're ${ctx.shortfall.toLocaleString('en')} ${ctx.tokenName ?? 'tokens'} short, go play some more!`
        : `Not enough ${ctx.tokenName ?? 'tokens'} for this one, go play some more!`;
    case 'already_owned':
      return 'You already own this one, check your loadout.';
    case 'not_for_sale':
      return "This one isn't for sale anymore :(";
    case 'not_owned':
      return "You don't own this one yet, buy it first!";
    case 'not_found':
      return "That item doesn't exist anymore, reopen the shop and try again.";
    default:
      return "That didn't work, the server said no. Try again in a bit!";
  }
};

// How many tokens are missing to buy `item`; 0 when it's affordable.
export const cosmeticShortfall = (item: Pick<CosmeticItemInterface, 'price'>, balance: number): number =>
  Math.max(0, item.price - balance);

// Puts `itemId` in use for its type (or nothing when null), the way select and
// clear change things server-side. Used for optimistic updates.
export const withSelection = (
  items: CosmeticItemInterface[],
  type: CosmeticType,
  itemId: string | null,
): CosmeticItemInterface[] =>
  items.map(item => item.type === type ? { ...item, selected: item.id === itemId } : item);

// Copies `owned`/`selected` from the inventory onto the shop list, so both
// lists agree after a select/clear that only answered with the inventory.
export const syncShopWithInventory = (
  shop: CosmeticItemInterface[],
  inventory: CosmeticItemInterface[],
): CosmeticItemInterface[] => {
  const owned = new Map(inventory.map(item => [item.id, item]));
  return shop.map((item) => {
    const mine = owned.get(item.id);
    return { ...item, owned: !!mine, selected: mine?.selected ?? false };
  });
};

// The item of `type` currently in use, if any.
export const equippedOf = (items: CosmeticItemInterface[], type: CosmeticType): CosmeticItemInterface | undefined =>
  items.find(item => item.type === type && item.selected);

// Everything to show with "Owned only" off: the shop in catalogue order, then
// owned items the shop doesn't sell (achievement and staff grants, retired
// items), in the order they were got.
export const shopWithOwned = (
  shop: CosmeticItemInterface[],
  inventory: CosmeticItemInterface[] | null,
): CosmeticItemInterface[] => {
  const forSale = new Set(shop.map(item => item.id));
  return [...shop, ...(inventory ?? []).filter(item => !forSale.has(item.id))];
};

// The files a SOUND item may play, or null when there's nothing to play (not a
// sound, or the backend couldn't reach Mojang).
export const cosmeticSoundFilesOf = (item: Pick<CosmeticItemInterface, 'type' | 'preview'> | undefined): SoundFileInterface[] | null =>
  item?.type === 'SOUND' && item.preview?.length ? item.preview : null;

// Picks one file by weight, the way the game does. `roll` is in [0, 1).
export const pickSoundFile = (files: SoundFileInterface[], roll = Math.random()): SoundFileInterface | null => {
  const weights = files.map(file => Math.max(0, file.weight));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return files[0] ?? null;
  let left = roll * total;
  for (let i = 0; i < files.length; i++) {
    left -= weights[i]!;
    if (left < 0) return files[i]!;
  }
  return files[files.length - 1] ?? null;
};
