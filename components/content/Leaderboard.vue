<template>
  <Card v-if="data" class="items-start">
    <div class="flex justify-between">
      <div>
        <h1>Top 10</h1>
        <i>Of the last 30 days</i>
      </div>
      <div class="text-right">
        <Multiselect
            v-model="selectedServers"
            :options="servers ?? []"
            label="name"
            value-prop="value"
            mode="single"
            :hideSelected="false"
            placeholder="Select server"
            :classes="{
              optionPointed: 'text-white bg-secondaryLight',
              optionSelected: 'text-white bg-secondary',
              optionSelectedPointed: 'text-white bg-secondary opacity-90',
              containerActive: 'ring ring-black ring-opacity-30',

            }"
        />
        <i>Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</i>
      </div>
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
          <td><NuxtLink class="underline" :to="`?name=${playTime.displayName ?? playTime.name}`"><b>{{ (playTime.displayName ?? playTime.name) }}</b></NuxtLink></td>
          <td class="text-right">{{ formatTime(playTime.playtime) }}</td>
        </tr>
      </tbody>
    </table>
  </Card>
  <Card v-else>
    Something did the big goof
  </Card>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>

<style>
.multiselect-dropdown {
  @apply overflow-y-auto;
}
</style>

<script lang="ts" setup>
import appConfig from "~/app.config";
import type LeaderboardResultRowInterface from "~/interfaces/LeaderboardResultRowInterface";
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type ServerResponse from "~/interfaces/ServerResponse";
import Multiselect from '@vueform/multiselect'

const selectedServers = ref<string>()

const { data: servers } = useFetch<ServerResponse[]>('/api/servers')
const formatTime = (time: number) => useDayjs().duration(time, 'seconds').as('hours').toFixed(2) + ' h'

const { data, refresh } = await useFetch<PenguBotResponseInterface<LeaderboardResultRowInterface[]>|null>('/api/leaderboard', {
  query: {
    'servers[]': selectedServers
  }
})

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(refresh, appConfig.secondsToRefreshLeaderBoard * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})
</script>