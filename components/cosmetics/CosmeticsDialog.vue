<template>
  <dialog
    ref="dialogEl"
    class="cosmetics-dialog panel-dark"
    aria-labelledby="cosmetics-title"
    @cancel="onCancel"
    @close="onNativeClose"
    @click="onBackdropClick"
  >
    <div class="layout">
      <!-- Header: title, balance, close -->
      <div class="area-head flex items-center gap-3">
        <h2 id="cosmetics-title" class="text-xl md:text-2xl leading-none grow">Cosmetics</h2>
        <div v-if="balance" class="text-right leading-none">
          <span class="font-[minecraft] text-lg text-beak">{{ balance.amount.toLocaleString('en') }}</span>
          <span class="ml-1 text-sm text-white/70">{{ balance.tokenName }}</span>
        </div>
        <Loading v-else width="7em" />
        <button
          type="button"
          class="pixel-btn !p-0 w-9 h-9 text-lg shrink-0"
          aria-label="Close cosmetics"
          @click="close()"
        >
          <PixelIcon name="close" />
        </button>
      </div>

      <!-- The preview: what the current pick looks like in chat -->
      <CosmeticsPreviewStage
        class="area-stage"
        :badge="preview.BADGE"
        :join="preview.JOIN_MESSAGE"
        :leave="preview.LEAVE_MESSAGE"
        :sound="preview.SOUND"
        :highlight="selected?.type ?? type"
        :player-name="playerName"
      />

      <!-- What's picked -->
      <div class="area-meta min-w-0">
        <template v-if="selected">
          <div class="flex items-center gap-2 min-w-0">
            <p class="font-[minecraft] text-lg leading-tight truncate">
              <span v-if="selected.nameHtml" v-html="selected.nameHtml" />
              <span v-else>{{ stripMiniMessage(selected.name) }}</span>
            </p>
            <CosmeticsSoundButton :item="selected" class="shrink-0" />
          </div>
          <p class="text-sm text-white/70">
            {{ selected.typeName }}<template v-if="selected.selected">, in use</template><template v-else-if="selected.owned">, owned</template><template v-if="selected.achievement">, granted by
              <NuxtLink to="/#achievements" class="!text-ice">{{ achievementName(selected.achievement) }}</NuxtLink></template>
          </p>
        </template>
      </div>

      <div class="area-action">
        <CosmeticsCosmeticAction
          v-if="selected && balance"
          v-model:confirming="confirming"
          :item="selected"
          :balance="balance"
          :busy="busy"
          :error="error"
          :achievement-name="selected.achievement ? achievementName(selected.achievement) : undefined"
          @buy="buySelected"
          @equip="equipSelected"
          @unequip="unequipSelected"
        />
      </div>

      <!-- Tabs + owned-only toggle -->
      <div class="area-tabs flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Cosmetic type" class="flex flex-wrap gap-1.5">
          <button
            v-for="t in COSMETIC_TYPES"
            :key="t.type"
            type="button"
            role="tab"
            class="tab font-[minecraft] text-sm px-3 py-1"
            :class="{ 'is-current': t.type === type }"
            :aria-selected="t.type === type"
            aria-controls="cosmetics-grid"
            @click="switchType(t.type)"
          >{{ t.label }}</button>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <!-- Only where there's something to hear -->
          <label v-if="type === 'SOUND' && list?.some(canPlay)" class="flex items-center gap-2 text-sm cursor-pointer">
            <PixelSwitch v-model="playOnPick" label="Play when picked" />
            Play when picked
          </label>
          <label class="flex items-center gap-2 text-sm cursor-pointer">
            <PixelSwitch v-model="ownedOnly" label="Owned only" />
            Owned only
          </label>
        </div>
      </div>

      <!-- The slots -->
      <div class="area-grid overflow-y-auto overscroll-contain min-h-0 -mx-1 px-1 py-1">
        <p v-if="loadError" role="alert" class="py-6 text-center text-white/80">{{ loadError }}</p>

        <div
          v-else-if="list"
          id="cosmetics-grid"
          ref="gridEl"
          role="listbox"
          :aria-label="`${typeLabel} items`"
          class="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1"
          @keydown="onGridKeydown"
        >
          <CosmeticsItemSlot
            v-for="item in list"
            :key="item.id"
            :item="item"
            :active="item.id === selected?.id"
            :balance="balance?.amount ?? 0"
            :tabindex="item.id === selected?.id ? 0 : -1"
            :data-id="item.id"
            @click="onSlotClick(item)"
          />
        </div>

        <div v-else class="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-1" aria-hidden="true">
          <Loading v-for="i in 9" :key="i" class="aspect-square w-full" />
        </div>

        <p v-if="list && !list.length && ownedOnly" class="py-6 text-center text-white/80">
          You don't own anything here yet! Turn off <i>Owned only</i> and go shopping.
        </p>
        <p v-else-if="list && !list.length" class="py-6 text-center text-white/80">
          Nothing for sale here right now, check back later!
        </p>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import type { CosmeticType } from '~/interfaces/CosmeticItemInterface';
import type AchievementWithProgressInterface from '~/interfaces/AchievementWithProgressInterface';
import { COSMETIC_TYPES, equippedOf, shopWithOwned } from '~/utils/cosmetics';
import { stripMiniMessage } from '~/utils/plainText';

// The shop and the inventory in one dialog, opened from the loadout panel.
// Open state is the ?cosmetics= query (see useCosmeticsDialog), so this
// component only mirrors the URL onto the native <dialog>.
defineProps<{ playerName: string }>();

const { requested, type, open, close } = useCosmeticsDialog();
const { shop, inventory, balance, loadError, loadShop, loadInventory, buy, setEquipped } = useCosmetics();

const dialogEl = ref<HTMLDialogElement | null>(null);
const gridEl = ref<HTMLElement | null>(null);

const ownedOnly = ref(false);
const { playOnPick, canPlay, play, stop: stopSound } = useCosmeticSound();
const selectedId = ref<string | null>(null);
const confirming = ref(false);
const busy = ref(false);
const error = ref<string | null>(null);

const typeLabel = computed(() => COSMETIC_TYPES.find(t => t.type === type.value)!.label);

// The inventory also has achievement grants and retired items the shop doesn't
// sell, so those are added to the full list too.
const list = computed(() => {
  const source = ownedOnly.value
    ? inventory.value
    : shop.value && shopWithOwned(shop.value, inventory.value);
  return source?.filter(item => item.type === type.value) ?? null;
});

const selected = computed(() => list.value?.find(item => item.id === selectedId.value));

// Keep a valid pick: the equipped item of the tab, else the first slot.
watch([list, type], () => {
  if (!list.value || selected.value) return;
  selectedId.value = (equippedOf(list.value, type.value) ?? list.value[0])?.id ?? null;
}, { immediate: true });

// Everything currently in use, with the pick swapped in for its type.
const preview = computed(() => {
  const owned = inventory.value ?? [];
  const slots = Object.fromEntries(
    COSMETIC_TYPES.map(t => [t.type, equippedOf(owned, t.type)]),
  ) as Record<CosmeticType, CosmeticItemInterface | undefined>;
  if (selected.value) slots[selected.value.type] = selected.value;
  return slots;
});

const pick = (item: CosmeticItemInterface) => {
  if (item.id === selectedId.value) return;
  selectedId.value = item.id;
  confirming.value = false;
  error.value = null;
};

// Clicking a sound plays it (again, if it's already picked). Arrow keys only
// pick, so moving through the grid doesn't fire off every sound on the way.
const onSlotClick = (item: CosmeticItemInterface) => {
  pick(item);
  if (playOnPick.value && canPlay(item)) play(item);
};

const switchType = (to: CosmeticType) => {
  if (to === type.value) return;
  stopSound();
  selectedId.value = null;
  confirming.value = false;
  error.value = null;
  open(to);
};

// ── Actions ────────────────────────────────────────────────────
const act = async (fn: () => Promise<string | null>) => {
  busy.value = true;
  error.value = await fn();
  busy.value = false;
};

const buySelected = () => act(async () => {
  const item = selected.value!;
  const failed = await buy(item);
  if (!failed) confirming.value = false;
  return failed;
});
const equipSelected = () => act(() => setEquipped(selected.value!.type, selected.value!));
const unequipSelected = () => act(() => setEquipped(selected.value!.type, null, selected.value!));

// ── Achievement names for "granted by" ─────────────────────────
const achievementNames = useState<Record<string, string> | null>('cosmetics-achievement-names', () => null);
const loadAchievementNames = async () => {
  if (achievementNames.value) return;
  try {
    const res = await $fetch<{ achievements: AchievementWithProgressInterface[] }>('/api/user/achievements');
    achievementNames.value = Object.fromEntries(res.achievements.map(a => [a.key, a.name]));
  } catch {
    // Falls back to the raw key.
  }
};
const achievementName = (key: string) => achievementNames.value?.[key] ?? key;

// ── Open / close ───────────────────────────────────────────────
// Focus goes back to whatever opened the dialog (a loadout slot or button).
let opener: HTMLElement | null = null;

const show = async () => {
  const el = dialogEl.value;
  if (!el || el.open) return;
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  ownedOnly.value = false;
  confirming.value = false;
  error.value = null;
  el.showModal();
  loadShop();
  loadInventory();
  loadAchievementNames();
  await nextTick();
  focusSelected();
};

const hide = () => {
  stopSound();
  const el = dialogEl.value;
  if (el?.open) el.close();
  opener?.focus();
  opener = null;
};

watch(requested, on => (on ? show() : hide()));
onMounted(() => { if (requested.value) show(); });

// Esc backs out of a buy confirm first, and only closes on the second press.
const onCancel = (event: Event) => {
  event.preventDefault();
  if (confirming.value) confirming.value = false;
  else close();
};

// Some browsers close anyway on a repeated Esc; keep the URL in sync.
const onNativeClose = () => {
  if (requested.value) close();
};

// A click on the dialog element itself (not its content) is the backdrop. It
// does nothing mid-confirm, so a stray click can't lose a half-made purchase.
const onBackdropClick = (event: MouseEvent) => {
  if (event.target === dialogEl.value && !confirming.value) close();
};

// ── Keyboard: roving focus across the slot grid ────────────────
const focusSelected = () => {
  gridEl.value?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
};

const onGridKeydown = async (event: KeyboardEvent) => {
  const items = list.value;
  if (!items?.length || !gridEl.value) return;
  const columns = getComputedStyle(gridEl.value).gridTemplateColumns.split(' ').length;
  const index = Math.max(0, items.findIndex(item => item.id === selectedId.value));
  const step = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns }[event.key];
  let next: number | undefined;
  if (step !== undefined) next = Math.min(items.length - 1, Math.max(0, index + step));
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = items.length - 1;
  if (next === undefined) return;
  event.preventDefault();
  pick(items[next]!);
  await nextTick();
  focusSelected();
};
</script>

<style scoped>
@reference "~/assets/css/main.css";

/* Reset the UA dialog box; .panel-dark supplies the surface. It also sets
   position: relative, which would knock the modal out of its centered spot,
   so put back what the UA's dialog:modal rule gives. */
.cosmetics-dialog {
  position: fixed;
  inset: 0;
  margin: auto;
  padding: 0;
  color: white;
  width: min(56rem, calc(100% - 2rem));
  max-width: none;
  max-height: 85vh;
}
.cosmetics-dialog[open] {
  display: flex;
  flex-direction: column;
  animation: dialog-in 0.15s ease-out;
}
.cosmetics-dialog::backdrop {
  background: color-mix(in srgb, var(--color-ink) 70%, transparent);
}

.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto auto auto minmax(0, 1fr);
  grid-template-areas:
    "head head"
    "stage stage"
    "meta action"
    "tabs tabs"
    "grid grid";
  gap: 0.75rem 1rem;
  flex: 1 1 auto;
  min-height: 0;
  padding: 1rem 1.25rem 1.25rem;
}
.area-head { grid-area: head; }
.area-stage { grid-area: stage; }
.area-meta { grid-area: meta; }
.area-action { grid-area: action; align-self: end; }
.area-tabs { grid-area: tabs; }
.area-grid { grid-area: grid; }

.tab {
  border: 2px solid var(--panel-border);
  background: var(--slot-face);
  color: color-mix(in srgb, white 75%, transparent);
  cursor: pointer;
}
.tab:hover { color: white; }
.tab.is-current {
  background: var(--color-ice);
  color: var(--color-ink);
}
.tab:focus-visible {
  @apply outline-2 outline-offset-2;
  outline-color: var(--focus-ring);
}

@keyframes dialog-in {
  from { opacity: 0; transform: scale(0.96); }
}

/* Phones: a bottom sheet, with the action pinned under the grid where the
   thumb is. */
@media (max-width: 767px) {
  .cosmetics-dialog {
    width: 100%;
    max-height: 92vh;
    margin: auto 0 0;
    border-bottom: 0;
  }
  .cosmetics-dialog[open] { animation-name: sheet-in; }
  .layout {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto auto minmax(0, 1fr) auto;
    grid-template-areas: "head" "stage" "meta" "tabs" "grid" "action";
    padding: 0.75rem 1rem 1rem;
  }
  .area-action {
    border-top: 2px solid var(--panel-border);
    padding-top: 0.75rem;
  }
}

@keyframes sheet-in {
  from { transform: translateY(100%); }
}

@media (prefers-reduced-motion: reduce) {
  .cosmetics-dialog[open] { animation: none; }
}
</style>
