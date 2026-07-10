<script setup lang="ts">
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type PlayTimeResultInterface from "~/interfaces/PlayTimeResultInterface";

const props = defineProps<{
  data: PenguBotResponseInterface<PlayTimeResultInterface>,
  donatorStatus: string|null
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

const formatTime = (time: number) => '~' + useDayjs().duration(time, 'seconds').humanize()

</script>

<template>
  <div v-if="data" class="flex flex-row gap-2 h-full">
    <div class="self-center"><img :src="`https://api.mineatar.io/body/full/${data.data.uuid}?scale=10`" alt="Player Avatar" class="px-5 py-2 w-48"></div>
    <div class="border-l self-stretch border-ink/10" />
    <div class="grow">
      <div class="text-center">
        <h1 class="font-[minecraft] uppercase"><span v-if="!loggedIn">(Not) </span>Your Minecraft Account</h1>
        <span class="text-sm text-secondaryLight">Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</span>
      </div>
      <table class="pixel-table">
        <tbody>
        <tr>
          <th class="w-36 text-left">Username</th>
          <td>{{ displayName }}</td>
        </tr>
        <tr>
          <th class="w-36 text-left">Current Level</th>
          <td>{{ data.data.currentLevel }}</td>
        </tr>
        <tr>
          <th class="w-36 text-left">Next Level in</th>
          <td>{{ formatTime(data.data.timeToNextLevel - data.data.playTimeSum) }}</td>
        </tr>
        <tr>
          <th class="w-36 text-left">Total Playtime</th>
          <td>{{ formatTime(data.data.playTimeSum) }}</td>
        </tr>
        </tbody>
      </table>
      <hr class="my-2 border-ink/15">
      <table class="pixel-table">
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
  </div>
</template>

<style scoped>

</style>