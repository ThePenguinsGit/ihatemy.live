<template>
  <div>
    <Card class="w-full ">
      <div>
        <h2>Check your progress</h2>
        <input type="text" autocomplete="off" class="w-full px-2 my-1 bg-gray-300 rounded-sm placeholder:text-gray-700 placeholder:italic border-black border border-solid" :spellcheck="false" v-model="username" placeholder="Username">
        <hr class="pb-2 mt-1" v-if="username.length > 0">
        <div v-if="data" class="flex flex-col gap-2 items-center">
          <i>Refreshed {{$dayjs(data.time).local().format('DD.MM.YYYY HH:mm')}}</i>
          <div class="flex flex-row gap-2 items-center place-content-around w-full">
            <img :src="`https://crafatar.com/avatars/${data.data.uuid}?overlay`" alt="Player Avatar" class="rounded-md w-24 h-24">
            <div>
              <table>
                <tbody>
                  <tr>
                    <th>Username</th>
                    <td>{{ data.data.userName }}</td>
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
        <div v-if="error && error.statusCode === 404 && username.length > 0">
          <div class="text-center">
            <p>I have never seen that user in my LIFE</p>
            <p>Try another username</p>
            <p>👁👄👁</p>
            <p>(╯°□°)╯︵ ┻━┻</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import appConfig from "~/app.config";
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";

const route = useRoute();
const reactiveQuery = computed(() => route.query.name);
const username = ref<string>(useRoute().query.name as string ?? '');
watch(reactiveQuery, () => username.value = reactiveQuery.value as string ?? '');

const { data, error, refresh } = await useFetch<PenguBotResponseInterface<PlayTimeResultInterface>|null>('/api/playtime', {
  immediate: true,
  query: {  name: username }
})

const formatTime = (time: number) => '~' + useDayjs().duration(time, 'seconds').humanize()

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(() => {
    if (username.value.length > 0) refresh()
  }, appConfig.secondsToRefreshLeaderBoard * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})
</script>

<style>

</style>