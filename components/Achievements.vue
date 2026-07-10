<template>
  <Card variant="panel" class="flex flex-col gap-4">
    <div class="flex justify-between items-baseline gap-2">
      <h2 class="font-[minecraft] uppercase text-lg">Achievements</h2>
      <i v-if="achievements">{{ completedCount }} / {{ achievements.length }} unlocked</i>
      <i v-else>Loading…</i>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <template v-if="achievements">
        <Card
          v-for="achievement in achievements"
          :key="achievement.id"
          class="flex flex-col items-center text-center gap-2"
          :title="achievement.description"
        >
          <PixelIcon
            name="advancement"
            class="text-4xl"
            :class="achievement.completed ? 'text-beak' : 'text-secondaryLight'"
          />
          <div
            class="font-[minecraft] uppercase text-sm leading-tight break-words w-full"
            :class="achievement.completed ? '' : 'text-secondaryLight'"
          >
            {{ achievement.name }}
          </div>

          <div class="w-full mt-auto">
            <div
              class="ach-bar"
              role="progressbar"
              :aria-valuenow="Math.round(progress(achievement) * 100)"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`${achievement.name} progress`"
            >
              <div
                class="ach-bar__fill"
                :class="{ 'is-done': achievement.completed }"
                :style="{ width: `${progress(achievement) * 100}%` }"
              />
            </div>
            <div class="text-xs text-secondaryLight mt-1 font-mono">
              {{ achievement.displayCurrent }} / {{ achievement.displayTarget }}{{ achievement.displayUnit }}
            </div>
          </div>
        </Card>
      </template>

      <template v-else>
        <Card v-for="i in 10" :key="i" class="flex flex-col items-center gap-2">
          <Loading width="2.5em" height="2.5em" />
          <Loading width="5em" />
          <Loading width="100%" height="0.75em" />
        </Card>
      </template>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import type AchievementWithProgressInterface from "~/interfaces/AchievementWithProgressInterface";

const { data } = await useFetch<{ achievements: AchievementWithProgressInterface[] }>('/api/user/achievements', {
  server: false,
})

const achievements = computed(() => data.value?.achievements)
const completedCount = computed(() => achievements.value?.filter(a => a.completed).length ?? 0)

const progress = (achievement: AchievementWithProgressInterface): number => {
  if (achievement.completed) return 1
  if (achievement.target <= 0) return 0
  return Math.min(1, Math.max(0, achievement.current / achievement.target))
}
</script>

<style scoped>
.ach-bar {
  height: 8px;
  border: 2px solid var(--color-ink);
  background: color-mix(in srgb, var(--color-ink) 10%, transparent);
  overflow: hidden;
}

.ach-bar__fill {
  height: 100%;
  background: var(--color-secondaryLight);
}

.ach-bar__fill.is-done {
  background: var(--color-beak);
}
</style>
