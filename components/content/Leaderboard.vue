<template>
  <Card>
    <i>Of the last 30 days</i>
    <table class="w-full divide-y ">
      <thead>
        <tr>
          <th class="w-10" />
          <th>Username</th>
          <th>Playtime</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="playTime in data" :key="playTime.uuid">
          <td class="w-14 py-2"><img :src="`https://crafatar.com/avatars/${playTime.uuid}`" alt="Player Avatar" class="rounded-md w-10"></td>
          <td><NuxtLink class="underline" :to="`?name=${playTime.name}`"><b>{{ playTime.name }}</b></NuxtLink></td>
          <td>{{ formatTime(playTime.playtime) }}</td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>

<script lang="ts" setup>
import type LeaderboardResultRowInterface from "~/interfaces/LeaderboardResultRowInterface";

const formatTime = (time: number) => '~' + useDayjs().duration(time, 'seconds').humanize()

const { data } = await useFetch<LeaderboardResultRowInterface[]>('/api/leaderboard')
</script>