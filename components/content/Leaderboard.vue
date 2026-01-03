<template>
  <Card class="items-start">
    <div class="flex justify-between">
      <div>
        <h1>Top {{ data?.data.length ?? 10 }}<span v-if="(data?.data.length ?? 0) < 10" title="For now">*</span></h1>
        <i>Of the last 30 days</i>
      </div>
      <div class="text-right">
        <Multiselect
            v-if="data"
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
        <Loading v-else class="!block" height="42px" width="190px"/>
        <i v-if="data">Refreshed {{$dayjs(data?.time).local().format('DD.MM.YYYY HH:mm')}}</i>
        <i v-else>Loading...</i>
      </div>
    </div>
    <table class="w-full divide-y ">
      <thead>
        <tr>
          <th class="w-10" />
          <th>Username</th>
          <th class="w-32">Playtime</th>
        </tr>
      </thead>
      <tbody v-if="data">
        <tr v-for="playTime in (data.data)" :key="playTime.uuid">
          <td class="w-14 py-2"><img :src="`https://mc-heads.net/avatar/${playTime.uuid}`" alt="Player Avatar" class="rounded-md w-10"></td>
          <td v-if="playTime.displayName !== null">
            <NuxtLink class="underline" :to="`?name=${playTime.displayName}`">
              <b :title="playTime.name">{{ playTime.displayName }}</b>
            </NuxtLink>
            <i :title="playTime.name">*</i>
          </td>
          <td v-else>
            <NuxtLink class="underline" :to="`?name=${playTime.name}`">
              <b>{{ playTime.name }}</b>
            </NuxtLink>
          </td>
          <td class="text-right">{{ formatTime(playTime.playtime) }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="i in 10" :key="i">
          <td class="w-14 py-2"><Loading class="rounded-md w-10 h-10"/></td>
          <td><Loading :width="new Rand((i * 1000).toString()).next() * 18 + 'em'">&nbsp;</Loading></td>
          <td class="text-right"><Loading :width="new Rand((i * 1000).toString()).next() * 6 + 'em'">&nbsp;</Loading></td>
        </tr>
      </tbody>
    </table>
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
import Rand from "rand-seed";

const selectedServers = ref<string>()

const { data: servers } = useApiFetch<ServerResponse[]>('/servers')
const formatTime = (time: number) => useDayjs().duration(time, 'seconds').as('hours').toFixed(2) + ' h'

const { data, refresh } = await useApiFetch<PenguBotResponseInterface<LeaderboardResultRowInterface[]>|null>('/leaderboard', {
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