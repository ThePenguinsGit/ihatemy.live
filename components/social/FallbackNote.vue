<template>
  <p class="text-sm leading-snug">
    Can't do this on the website yet, just run
    <code class="whitespace-nowrap !bg-transparent !border-current/40 !text-inherit">{{ command }}</code>
    in game!
    <button
      type="button"
      class="copy inline-flex items-center gap-1 align-middle ml-1 font-[minecraft] text-xs cursor-pointer"
      :aria-label="copied ? 'Copied' : `Copy ${command}`"
      @click="copy"
    >
      <PixelIcon name="copy" /> {{ copied ? 'Copied!' : 'Copy' }}
    </button>
  </p>
</template>

<script setup lang="ts">
// Shown where a friend/party action's endpoint isn't live yet: the in-game
// command that does the same thing, with a copy button.
const props = defineProps<{ command: string }>();

const copied = ref(false);
const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.command);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  } catch {
    // Clipboard blocked; the command is right there to select by hand.
  }
};
</script>

<style scoped>
@reference "~/assets/css/main.css";

.copy:hover { text-decoration: underline; }
.copy:focus-visible {
  @apply outline-2 outline-offset-2;
  outline-color: var(--focus-ring);
}
</style>
