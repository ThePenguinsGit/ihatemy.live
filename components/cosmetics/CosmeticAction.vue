<template>
  <div class="flex flex-col items-stretch md:items-end gap-1.5">
    <!-- Buy, step two: confirm inside the button's spot, no second modal. -->
    <template v-if="confirming">
      <p class="text-sm text-white/80 md:text-right">
        {{ balance.amount.toLocaleString('en') }} → {{ (balance.amount - item.price).toLocaleString('en') }} {{ balance.tokenName }}
      </p>
      <div class="flex gap-2">
        <PixelButton ref="confirmButton" primary class="grow md:grow-0" :disabled="busy" @click="emit('buy')">
          {{ busy ? 'Buying…' : 'Buy it' }}
        </PixelButton>
        <PixelButton class="grow md:grow-0" :disabled="busy" @click="confirming = false">Nah</PixelButton>
      </div>
    </template>

    <PixelButton v-else-if="item.selected" :disabled="busy" @click="emit('unequip')">Unequip</PixelButton>
    <PixelButton v-else-if="item.owned" primary :disabled="busy" @click="emit('equip')">Equip</PixelButton>

    <template v-else-if="item.price > 0">
      <PixelButton
        v-if="shortfall === 0"
        primary
        @click="confirming = true"
      >Buy for {{ item.price.toLocaleString('en') }} {{ balance.tokenName }}</PixelButton>
      <PixelButton v-else disabled class="opacity-60 cursor-not-allowed">
        You need {{ shortfall.toLocaleString('en') }} more
      </PixelButton>
    </template>

    <p v-else-if="item.achievement" class="text-sm text-white/80 md:text-right">
      Unlock the
      <NuxtLink to="/#achievements" class="!text-ice">{{ achievementName ?? item.achievement }}</NuxtLink>
      achievement to get this one!
    </p>
    <p v-else class="text-sm text-white/60 md:text-right">Not for sale</p>

    <p v-if="error" role="alert" class="text-sm text-[color-mix(in_srgb,var(--color-ded)_45%,white)] md:text-right">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import type { CosmeticBalanceInterface } from '~/interfaces/CosmeticItemInterface';
import { cosmeticShortfall } from '~/utils/cosmetics';

// The one button under the preview. What it says follows the item: buy (with
// an inline confirm), equip, unequip, or how to get it when it isn't sold.
const props = defineProps<{
  item: CosmeticItemInterface,
  balance: CosmeticBalanceInterface,
  busy: boolean,
  error: string | null,
  achievementName?: string,
}>();

const emit = defineEmits<{ buy: [], equip: [], unequip: [] }>();

// Owned by the dialog so Esc can back out of the confirm before closing.
const confirming = defineModel<boolean>('confirming', { required: true });

const shortfall = computed(() => cosmeticShortfall(props.item, props.balance.amount));

// Put focus on "Buy it" when the confirm opens, so Enter twice is deliberate
// but keyboard users don't have to hunt for it.
const confirmButton = ref<{ $el: HTMLElement } | null>(null);
watch(confirming, async (on) => {
  if (!on) return;
  await nextTick();
  confirmButton.value?.$el.focus();
});
</script>
