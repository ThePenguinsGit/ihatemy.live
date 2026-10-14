import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import type { CosmeticBalanceInterface, CosmeticType } from '~/interfaces/CosmeticItemInterface';
import { cosmeticErrorMessage, cosmeticShortfall, syncShopWithInventory, withSelection } from '~/utils/cosmetics';

type ShopResponse = { items: CosmeticItemInterface[], balance: CosmeticBalanceInterface };
type InventoryResponse = { items: CosmeticItemInterface[] };

// Refusals from POST /user/cosmetics/{action} come back as `{ error: code }`.
const errorCodeOf = (error: unknown): string | undefined => {
  const data = (error as { data?: unknown })?.data;
  return data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : undefined;
};

// The shop, the inventory and the token balance, shared by the loadout panel
// and the cosmetics dialog so a change in one shows up in the other at once.
//
// Shop and inventory are separate lists on purpose: the shop only has items
// that are for sale, the inventory also has achievement grants and retired
// items. After select/clear (which answer with the inventory) the shop's
// owned/selected flags are re-synced from it.
export const useCosmetics = () => {
  const shop = useState<CosmeticItemInterface[] | null>('cosmetics-shop', () => null);
  const inventory = useState<CosmeticItemInterface[] | null>('cosmetics-inventory', () => null);
  const balance = useState<CosmeticBalanceInterface | null>('cosmetics-balance', () => null);
  const loadError = useState<string | null>('cosmetics-load-error', () => null);

  const loadShop = async () => {
    try {
      const res = await $fetch<ShopResponse>('/api/user/cosmetics/shop');
      shop.value = res.items;
      balance.value = res.balance;
      loadError.value = null;
    } catch {
      loadError.value = "The shop didn't load. Close this and try again in a bit!";
    }
  };

  const loadInventory = async () => {
    try {
      const res = await $fetch<InventoryResponse>('/api/user/cosmetics');
      inventory.value = res.items;
      if (shop.value) shop.value = syncShopWithInventory(shop.value, res.items);
    } catch {
      // The loadout keeps showing what it had; the dialog shows loadError for the shop.
    }
  };

  const post = <T>(action: 'buy' | 'select' | 'clear', itemId: string) =>
    $fetch<T>(`/api/user/cosmetics/${action}`, { method: 'POST', body: { itemId } });

  // Buying waits for the server: no optimistic update when tokens are involved.
  // Returns an error line for the UI, or null on success.
  const buy = async (item: CosmeticItemInterface): Promise<string | null> => {
    try {
      const res = await post<ShopResponse>('buy', item.id);
      shop.value = res.items;
      balance.value = res.balance;
      await loadInventory();
      return null;
    } catch (error) {
      return cosmeticErrorMessage(errorCodeOf(error), {
        shortfall: cosmeticShortfall(item, balance.value?.amount ?? 0),
        tokenName: balance.value?.tokenName,
      });
    }
  };

  // Equip (`itemId`) or unequip (null) a type. Optimistic: the preview changes
  // straight away and rolls back if the server refuses.
  const setEquipped = async (type: CosmeticType, item: CosmeticItemInterface | null, current?: CosmeticItemInterface): Promise<string | null> => {
    const before = { inventory: inventory.value, shop: shop.value };
    if (inventory.value) inventory.value = withSelection(inventory.value, type, item?.id ?? null);
    if (shop.value) shop.value = withSelection(shop.value, type, item?.id ?? null);

    // `clear` takes any item of the type; use the one in use.
    const target = item ?? current;
    if (!target) return null;

    try {
      const res = await post<InventoryResponse>(item ? 'select' : 'clear', target.id);
      inventory.value = res.items;
      if (shop.value) shop.value = syncShopWithInventory(shop.value, res.items);
      return null;
    } catch (error) {
      inventory.value = before.inventory;
      shop.value = before.shop;
      return cosmeticErrorMessage(errorCodeOf(error));
    }
  };

  return { shop, inventory, balance, loadError, loadShop, loadInventory, buy, setEquipped };
};
