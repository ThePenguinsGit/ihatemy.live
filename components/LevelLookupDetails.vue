<script setup lang="ts">
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type PlayTimeResultInterface from "~/interfaces/PlayTimeResultInterface";

const props = defineProps<{
  data: PenguBotResponseInterface<PlayTimeResultInterface>
}>()

const displayName = computed(() => {
  const internalData = props.data.data
  if (internalData === undefined) return undefined
  if (internalData.displayName === null || internalData.displayName === internalData.userName) return internalData.userName

  return `${internalData.displayName} (${internalData.userName})`
})

const formatTime = (time: number) => '~' + useDayjs().duration(time, 'seconds').humanize()
</script>

<template>
  <div v-if="data" class="flex flex-col gap-2 items-center">
    <i>Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</i>
    <div class="flex flex-row gap-2 items-center place-content-around w-full">
      <img :src="`https://crafatar.com/avatars/${data.data.uuid}?overlay`" alt="Player Avatar" class="rounded-md w-24 h-24">
      <div>
        <table>
          <tbody>
          <tr>
            <th>Username</th>
            <td>{{ displayName }}</td>
          </tr>
          <tr>
            <th>Current Level</th>
            <td>{{ data.data.currentLevel }}</td>
          </tr>
          <tr>
            <th>Next Level in</th>
            <td>{{ formatTime(data.data.timeToNextLevel - data.data.playTimeSum) }}</td>
          </tr>
          <tr>
            <th>Total Playtime</th>
            <td>{{ formatTime(data.data.playTimeSum) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <table class="w-full divide-y ">
      <thead>
      <tr>
        <th>Server</th>
        <th>Playtime</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="playTime in data?.data.playTimes" :key="playTime.serverName">
        <td>{{ playTime.serverName }}</td>
        <td>{{ formatTime(playTime.playtime) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>