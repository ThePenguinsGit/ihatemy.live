<template>
  <div>
    <Card class="w-96">
      <div>
        <input type="text" class="w-full px-2 my-1 bg-gray-300 rounded-sm placeholder:text-gray-700 placeholder:italic border-black border border-solid" :spellcheck="false" v-model="username" placeholder="Username">
        <hr class="pb-2 mt-1">
        <div v-if="data" class="flex flex-col gap-2 items-center">
          <div class="flex flex-row gap-2 items-center place-content-around w-full">
            <img :src="`https://crafatar.com/avatars/${data.uuid}`" alt="Player Avatar" class="rounded-md w-24 h-24">
            <div>
              <table>
                <tbody>
                  <tr>
                    <th>Username</th>
                    <td>{{ data.userName }}</td>
                  </tr>
                  <tr>
                    <th>Current Level</th>
                    <td>{{ data.currentLevel }}</td>
                  </tr>
                  <tr>
                    <th>Next Level in</th>
                    <td>{{ formatTime(data.timeToNextLevel - data.playTimeSum) }}</td>
                  </tr>
                  <tr>
                    <th>Total Playtime</th>
                    <td>{{ formatTime(data.playTimeSum) }}</td>
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
            <tr v-for="playTime in data?.playTimes" :key="playTime.serverName">
              <td>{{ playTime.serverName }}</td>
              <td>{{ formatTime(playTime.playtime) }}</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div v-if="error && error.statusCode === 404">
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
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';

const username = ref<string>('dukcc');
const { data, error } = await useFetch<PlayTimeResultInterface|null>('/api/playtime', {
  immediate: true,
  query: {  name: username }
})

const formatTime = (time: number) => '~' + useDayjs().duration(time, 'seconds').humanize()

watch(error, () => {
  console.log(error.value?.statusMessage)
})
</script>

<style>

</style>