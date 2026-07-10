<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    :title="label"
    class="pixel-switch"
    :class="{ on: model }"
    @click="model = !model"
  >
    <span class="pixel-switch__knob" />
  </button>
</template>

<script setup lang="ts">
// Chunky Minecraft-style on/off switch (Bedrock-toggle look, matches .pixel-btn).
const model = defineModel<boolean>({ required: true });

defineProps<{
  label?: string;
}>();
</script>

<style scoped>
@reference "~/assets/css/main.css";

.pixel-switch {
  @apply relative inline-block w-12 h-7 border-2 border-ink cursor-pointer select-none shrink-0;
  background: var(--color-secondaryLight);
  box-shadow: inset 0 2px 0 var(--panel-shadow-dark);
}
.pixel-switch.on {
  background: var(--color-alive);
  box-shadow: inset 0 2px 0 color-mix(in srgb, var(--color-aliveDark) 70%, transparent);
}
.pixel-switch:focus-visible {
  @apply outline-2 outline-offset-2;
  outline-color: var(--focus-ring);
}

/* The knob overhangs the track border by 2px on every side, like the Bedrock
   toggle's handle. Sized/positioned against the track's padding box, hence the
   calc() offsets to reach the outer border edge. */
.pixel-switch__knob {
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(50% + 4px);
  height: calc(100% + 4px);
  background: var(--color-snow);
  border: 2px solid var(--color-ink);
  box-shadow:
    inset -2px -2px 0 var(--panel-shadow),
    inset 2px 2px 0 var(--panel-highlight);
  transition: left 0.1s steps(2, end);
}
.pixel-switch.on .pixel-switch__knob {
  left: calc(50% - 2px);
}

/* Grip: three vertical lines on the knob, signalling it can be dragged/toggled. */
.pixel-switch__knob::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  width: 10px;
  height: 55%;
  background: repeating-linear-gradient(
    to right,
    color-mix(in srgb, var(--color-ink) 25%, var(--color-snow)) 0,
    color-mix(in srgb, var(--color-ink) 25%, var(--color-snow)) 2px,
    transparent 2px,
    transparent 4px
  );
}

@media (prefers-reduced-motion: reduce) {
  .pixel-switch__knob { transition: none; }
}
</style>
