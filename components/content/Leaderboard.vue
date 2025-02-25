<template>
  <Card v-if="data" class="items-start">
   <h1>Top 10</h1>
    <div class="flex justify-between">
      <i>Of the last 30 days</i>
      <i>Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</i>
    </div>
    <table class="w-full divide-y ">
      <thead>
        <tr>
          <th class="w-10" />
          <th>Username</th>
          <th>Playtime</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="playTime in (data.data)" :key="playTime.uuid">
          <td class="w-14 py-2"><img :src="`https://crafatar.com/avatars/${playTime.uuid}?overlay`" alt="Player Avatar" class="rounded-md w-10"></td>
          <td><NuxtLink class="underline" :to="`?name=${playTime.name}`"><b>{{ playTime.name }}</b></NuxtLink></td>
          <td class="text-right">{{ formatTime(playTime.playtime) }}</td>
        </tr>
      </tbody>
    </table>
  </Card>
  <Card v-else>
    Something did the big goof
  </Card>
</template>

<script lang="ts" setup>
import appConfig from "~/app.config";
import type LeaderboardResultRowInterface from "~/interfaces/LeaderboardResultRowInterface";
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";

const formatTime = (time: number) => useDayjs().duration(time, 'seconds').as('hours').toFixed(2) + ' h'

const { data, refresh } = await useFetch<PenguBotResponseInterface<LeaderboardResultRowInterface[]>|null>('/api/leaderboard')

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(refresh, appConfig.secondsToRefreshLeaderBoard * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})
</script>