<template>
  <Card v-if="data" class="items-start">
    <div class="flex justify-between">
      <div>
        <h1>Top {{ data.data.length }}<span v-if="data.data.length < 10" title="For now">*</span></h1>
        <i>with the highest Streak</i>
      </div>
      <div class="text-right flex items-end">
        <i class="">Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</i>
      </div>
    </div>
    <table class="w-full divide-y ">
      <thead>
        <tr>
          <th class="w-10" />
          <th>Username</th>
          <th>Current Streak</th>
          <th>Started</th>
          <th>Ends</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="voteResult in (data.data)" :key="voteResult.uuid">
          <td class="w-14 py-2"><img :src="`https://mc-heads.net/avatar/${voteResult.uuid}`" alt="Player Avatar" class="rounded-md w-10"></td>
          <td v-if="voteResult.displayName !== null"><b :title="voteResult.name">{{ voteResult.displayName }}</b><i :title="voteResult.name">*</i></td>
          <td v-else><b>{{ voteResult.name }}</b></td>
          <td class="text-right"><span class="text-gold">☆</span>{{ voteResult.votes }}</td>
          <td class="text-right"><code>{{ formatTime(voteResult.started) }}</code></td>
          <td class="text-right"><code>{{ formatTime(voteResult.expires) }}</code></td>
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
import type ServerResponse from "~/interfaces/ServerResponse";
import Multiselect from '@vueform/multiselect'
import type VoteLeaderboardRowInterface from "~/interfaces/VoteLeaderboardRowInterface";

const formatTime = (time: number) => useDayjs().unix(time).fromNow()

const { data, refresh } = await useFetch<PenguBotResponseInterface<VoteLeaderboardRowInterface[]>|null>('/api/vote-leaderboard')

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(refresh, appConfig.secondsToRefreshLeaderBoard * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})
</script>