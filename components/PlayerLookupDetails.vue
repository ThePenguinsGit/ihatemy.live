<script setup lang="ts">
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type PlayTimeResultInterface from "~/interfaces/PlayTimeResultInterface";

const props = defineProps<{
  data: PenguBotResponseInterface<PlayTimeResultInterface>,
  donatorStatus: string|null
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
  <div v-if="data" class="flex flex-row gap-2 h-full">
    <div class="self-center"><img :src="`https://crafatar.com/renders/body/${data.data.uuid}?overlay`" alt="Player Avatar" class="px-5 py-2 w-48"></div>
    <div class="border-l self-stretch" />
    <div class="flex-grow">
      <div class="text-center">
        <h1 v-if="useUserStore().isLoggedIn">Your Minecraft Account</h1>
        <h1 v-else>(Not) Your Minecraft Account</h1>
        <i>Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</i>
      </div>
      <table class="w-full">
        <tbody>
        <tr>
          <th class="w-36 text-left">Username</th>
          <td>{{ displayName }}</td>
        </tr>
        <tr>
          <th class="w-36 text-left">Donator Status</th>
          <td><i v-if="donatorStatus === null" class="text-gray-400 underline">None</i><span v-else v-html="donatorStatus"></span> (<a title="Do it RIGHT NOW, or else 👁👄👁" href="https://ko-fi.com/penguinnetwork" target="_blank">Support us</a>) </td>
        </tr>
<!--        <tr>-->
<!--          <th class="w-36 text-left">Donator Status</th>-->
<!--          <td><span class="adventure-component" style="color: #555555">❰<span class="adventure-component"><span class="adventure-component"><span class="adventure-component" style="color: #b76ed4">☆</span><span class="adventure-component" style="color: #db806a">☆</span><span class="adventure-component" style="color: #ff9100">A</span><span class="adventure-component" style="color: #ffbe1e">n</span><span class="adventure-component" style="color: #ffeb3b">g</span><span class="adventure-component" style="color: #ffbe1e">e</span><span class="adventure-component" style="color: #ff9100">l</span><span class="adventure-component" style="color: #db806a">☆</span><span class="adventure-component" style="color: #b76ed4">☆</span></span><span class="adventure-component"></span></span><span class="adventure-component" style="color: #555555">❱</span></span> (<a title="Do it RIGHT NOW, or else 👁👄👁" href="https://ko-fi.com/penguinnetwork" target="_blank">Support us</a>) </td>-->
<!--        </tr>-->
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
      <hr class="my-2">
      <table class="w-full divide-y">
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