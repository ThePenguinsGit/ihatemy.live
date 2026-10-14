<template>
  <button
    v-if="item && canPlay(item)"
    type="button"
    class="sound-btn inline-flex items-center justify-center gap-1.5 font-[minecraft] cursor-pointer"
    :class="{ 'is-playing': playing, 'is-compact': compact }"
    :aria-label="`${playing ? 'Stop' : 'Play'} ${plainName}`"
    :title="compact ? `${playing ? 'Stop' : 'Play'} ${plainName}` : undefined"
    @click.stop="toggle(item)"
  >
    <PixelIcon :name="playing ? 'stop' : 'play'" />
    <span v-if="!compact">{{ playing ? 'Stop' : 'Listen' }}</span>
  </button>
</template>

<script setup lang="ts">
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import { stripMiniMessage } from '~/utils/plainText';

// Plays or stops a SOUND cosmetic. Renders nothing for items with no file to
// play, so it can sit anywhere a sound is shown.
const props = defineProps<{
  item: CosmeticItemInterface | undefined,
  // Icon only, for inline use in the chat preview.
  compact?: boolean,
}>();

const { canPlay, isPlaying, toggle } = useCosmeticSound();

const playing = computed(() => isPlaying(props.item));
const plainName = computed(() => (props.item ? stripMiniMessage(props.item.name) : ''));
</script>

<style scoped>
@reference "~/assets/css/main.css";

.sound-btn {
  @apply text-sm px-2.5 py-1;
  color: var(--color-snow);
  background: color-mix(in srgb, white 10%, transparent);
  border: 2px solid color-mix(in srgb, white 30%, transparent);
}
.sound-btn:hover { background: color-mix(in srgb, white 18%, transparent); }
.sound-btn.is-playing {
  color: var(--color-ink);
  background: var(--color-ice);
  border-color: var(--color-ice);
}
.sound-btn.is-compact { @apply p-0.5 text-xs; }
.sound-btn:focus-visible {
  @apply outline-2 outline-offset-2;
  outline-color: var(--focus-ring);
}
</style>
