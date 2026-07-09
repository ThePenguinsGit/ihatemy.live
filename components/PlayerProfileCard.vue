<template>
  <Card v-if="data" variant="panel" class="flex flex-col sm:flex-row gap-4 h-full">
    <!-- Avatar -->
    <div class="self-center shrink-0 mx-auto sm:mx-0">
      <McHead
          :uuid="data.data.uuid"
        :alt="displayName"
        class="w-32 sm:w-36"
      />
    </div>

    <div class="border-l self-stretch hidden sm:block border-ink/10" />

    <div class="grow flex flex-col gap-3 min-w-0">
      <div class="text-center sm:text-left">
        <h1 class="font-[minecraft] uppercase text-lg leading-tight"><span v-if="!loggedIn">(Not) </span>Your Minecraft Account</h1>
      </div>

      <div class="flex flex-wrap items-center gap-2 justify-between w-full">
        <span class="font-[minecraft] block text-lg truncate">{{ displayName }}</span>
      </div>

      <div>
        <div class="flex items-baseline justify-between gap-2">
          <span class="font-[minecraft] uppercase text-sm text-iceDeep">Level {{ data.data.currentLevel }}</span>
          <span class="text-sm text-secondaryLight text-right">{{ formatTime(timeToNext) }} → Lvl {{ data.data.currentLevel + 1 }}</span>
        </div>
        <div
          class="xp-bar mt-1"
          role="progressbar"
          :aria-valuenow="Math.round(progress * 100)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`Progress to level ${data.data.currentLevel + 1}`"
        >
          <div class="xp-bar__fill" :style="{ width: `${progress * 100}%` }" />
        </div>
      </div>

      <div class="mt-auto text-center sm:text-left">
        <div class="font-[minecraft] text-2xl leading-none">{{ formatTime(data.data.playTimeSum) }}</div>
        <div class="text-xs uppercase tracking-wider text-secondaryLight">total playtime</div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type PlayTimeResultInterface from "~/interfaces/PlayTimeResultInterface";

const props = defineProps<{
  data: PenguBotResponseInterface<PlayTimeResultInterface>,
}>()

const { loggedIn, user } = useUserSession()

const nickname = computed(() => {
  return loggedIn.value
      ? user.value?.name
      : props.data.data.displayName
})

const displayName = computed(() => {
  const internalData = props.data.data
  if (internalData === undefined) return undefined
  if (nickname.value === null || nickname.value === internalData.userName) return internalData.userName

  return `${nickname.value} (${internalData.userName})`
})

const timeToNext = computed(() => props.data.data.timeToNextLevel - props.data.data.playTimeSum)

const progress = computed(() => {
  const { timeForCurrentLevel, timeToNextLevel, playTimeSum } = props.data.data
  const span = timeToNextLevel - timeForCurrentLevel
  if (span <= 0) return 0
  return Math.min(1, Math.max(0, (playTimeSum - timeForCurrentLevel) / span))
})

const formatTime = (time: number) => '~' + useDayjs().duration(time, 'seconds').humanize()
</script>

<style scoped>
.xp-bar {
  height: 10px;
  border: 2px solid var(--color-ink);
  background: color-mix(in srgb, var(--color-ink) 10%, transparent);
  overflow: hidden;
}

.xp-bar__fill {
  height: 100%;
  background: repeating-linear-gradient(
    135deg,
    var(--color-beak),
    var(--color-beak) 6px,
    var(--color-beakDark) 6px,
    var(--color-beakDark) 12px
  );
  transition: width 0.4s ease;
}

@media (prefers-reduced-motion: reduce) {
  .xp-bar__fill {
    transition: none;
  }
}
</style>
