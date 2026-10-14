<template>
  <button
    type="button"
    role="option"
    class="mc-slot w-full"
    :class="{ 'is-active': active, 'is-equipped': item.selected, 'is-locked': locked, 'is-playing': playing }"
    :aria-selected="active"
    :aria-label="label"
    :title="plainName"
  >
    <span
      v-if="item.type === 'BADGE' && item.contentHtml"
      class="slot-badge font-[minecraft] text-sm leading-none text-center px-0.5"
      v-html="item.contentHtml"
    />
    <PixelIcon v-else :name="icon" class="slot-icon text-2xl text-white/85" />

    <span
      v-if="!item.owned && item.price > 0"
      class="absolute right-1 bottom-0.5 font-[minecraft] text-xs leading-none"
      :class="locked ? 'text-ded' : 'text-beak'"
    >{{ shortPrice }}</span>
  </button>
</template>

<script setup lang="ts">
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import { stripMiniMessage } from '~/utils/plainText';
import { COSMETIC_ICONS } from '~/utils/cosmetics';

// One inventory slot. The price sits bottom-right like a stack count; it turns
// red when the item costs more than the balance. A sound that's playing makes
// its note hop.
const props = defineProps<{
  item: CosmeticItemInterface,
  active: boolean,
  balance: number,
}>();

const icon = computed(() => COSMETIC_ICONS[props.item.type]);

const { isPlaying } = useCosmeticSound();
const playing = computed(() => isPlaying(props.item));

const plainName = computed(() => stripMiniMessage(props.item.name));
const locked = computed(() => !props.item.owned && props.item.price > props.balance);

// Fits four characters in the corner: 950, 1.2k, 12k.
const shortPrice = computed(() => {
  const p = props.item.price;
  if (p < 1000) return String(p);
  const k = p / 1000;
  return `${k < 10 ? Math.floor(k * 10) / 10 : Math.floor(k)}k`;
});

const label = computed(() => {
  const state = props.item.selected ? 'in use'
    : props.item.owned ? 'owned'
    : props.item.price > 0 ? `${props.item.price.toLocaleString('en')} tokens`
    : 'not for sale';
  return `${plainName.value}, ${state}${playing.value ? ', playing' : ''}`;
});
</script>

<style scoped>
/* Unaffordable slots are dimmed, like a greyed-out recipe. */
.mc-slot.is-locked > :first-child { opacity: 0.45; }

/* The note hops in two hard steps while its sound plays. */
.mc-slot.is-playing .slot-icon {
  color: var(--color-ice);
  animation: hop 0.5s steps(2, jump-none) infinite;
}
@keyframes hop {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}
@media (prefers-reduced-motion: reduce) {
  .mc-slot.is-playing .slot-icon { animation: none; }
}

.slot-badge {
  text-shadow: 2px 2px 0 var(--chat-shadow);
  overflow-wrap: anywhere;
}
</style>
