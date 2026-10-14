<template>
  <Card variant="panel" class="flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-xl">Your loadout</h2>
      <div class="flex flex-wrap gap-2">
        <PixelButton v-if="inventory" class="!py-1 text-sm" @click="replayJoin">
          <PixelIcon name="join" class="mr-1" /> Replay join
        </PixelButton>
        <PixelButton class="!py-1 text-sm" @click="open('BADGE')">Open the shop</PixelButton>
      </div>
    </div>

    <CosmeticsPreviewStage
      :badge="equipped.BADGE"
      :join="equipped.JOIN_MESSAGE"
      :leave="equipped.LEAVE_MESSAGE"
      :sound="equipped.SOUND"
      :replay="replays"
      :player-name="playerName"
    />

    <!-- Hotbar: one slot per type, each opens the dialog on that tab -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <button
        v-for="t in COSMETIC_TYPES"
        :key="t.type"
        type="button"
        class="hotbar-slot flex items-center gap-2 p-1.5 pr-3 text-left cursor-pointer"
        :aria-label="`${t.label}: ${equipped[t.type] ? stripMiniMessage(equipped[t.type]!.name) : 'none'}. Change`"
        @click="open(t.type)"
      >
        <span class="mc-slot w-11 shrink-0 pointer-events-none" :class="{ 'is-equipped': equipped[t.type] }">
          <span
            v-if="t.type === 'BADGE' && equipped.BADGE?.contentHtml"
            class="font-[minecraft] text-xs leading-none text-center"
            v-html="equipped.BADGE.contentHtml"
          />
          <PixelIcon v-else :name="COSMETIC_ICONS[t.type]" class="text-xl" :class="equipped[t.type] ? 'text-white' : 'text-white/35'" />
        </span>
        <span class="min-w-0 leading-tight">
          <span class="block font-[minecraft] text-sm">{{ t.label }}</span>
          <span class="block text-xs text-secondaryLight truncate">
            {{ equipped[t.type] ? stripMiniMessage(equipped[t.type]!.name) : 'None' }}
          </span>
        </span>
      </button>
    </div>

    <p v-if="inventory && !inventory.length" class="text-sm">
      You don't own anything yet. Spend some tokens in the shop!
    </p>
  </Card>
</template>

<script setup lang="ts">
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import type { CosmeticType } from '~/interfaces/CosmeticItemInterface';
import { COSMETIC_ICONS, COSMETIC_TYPES, equippedOf } from '~/utils/cosmetics';
import { stripMiniMessage } from '~/utils/plainText';

// What you have equipped, shown in a chat preview, with a hotbar slot per type
// that opens the cosmetics dialog on that tab.
defineProps<{ playerName: string }>();

const { inventory, loadInventory } = useCosmetics();
const { open } = useCosmeticsDialog();

const equipped = computed(() => Object.fromEntries(
  COSMETIC_TYPES.map(t => [t.type, equippedOf(inventory.value ?? [], t.type)]),
) as Record<CosmeticType, CosmeticItemInterface | undefined>);

onMounted(loadInventory);

// Plays joining again: the join line types out and the join sound plays, the
// way everyone else sees and hears it.
const { canPlay, play } = useCosmeticSound();
const replays = ref(0);
const replayJoin = () => {
  replays.value++;
  const sound = equipped.value.SOUND;
  if (sound && canPlay(sound)) play(sound);
};
</script>

<style scoped>
@reference "~/assets/css/main.css";

.hotbar-slot {
  border: 2px solid transparent;
}
.hotbar-slot:hover {
  border-color: var(--divider);
  background: color-mix(in srgb, var(--color-ink) 4%, transparent);
}
.hotbar-slot:focus-visible {
  @apply outline-2 outline-offset-2;
  outline-color: var(--focus-ring);
}
</style>
