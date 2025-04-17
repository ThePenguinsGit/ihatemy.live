<template>
  <div class="px-5 flex flex-col gap-3">
    <iframe src="https://ko-fi.com/streamalerts/goaloverlay/sa_ed47c804-d1a7-4e42-ba00-1edff9d3e40d" height="57" class="-mb-1" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="flex flex-col gap-5 w-full">
        <AliveServerRow name="All The Mods 10" version="2.43" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="All The Mods 9" version="1.0.7" image-path="/img/atm9.png" hostname="atm9.ihatemy.live" mapUrl='https://atm9.ihatemy.live'/>
      </div>
      <div
          v-if="useUserStore().isLoggedIn"
          class="flex flex-col gap-2">
          <div class="card w-full flex flex-row justify-between">
            <h1 class="block">Your Account</h1>
            <div class="flex flex-row gap-2">
              <span class="block text-3xl text-gray-600">{{useUserStore().name}}</span>
              <img class="rounded-full border-black border max-h-[40px]" :src="`https://cdn.discordapp.com/avatars/${useUserStore().avatar}.png`">
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <NickSetting />
            <Card>
              <h1 class="text-center pb-2">Your Minecraft Account</h1>
              <LevelLookupDetails v-if="data" :data="data" />
              <div v-else>
                <h2>No data available</h2>
                <p>Make sure you have linked your Minecraft Account to your Discord Account.</p>
                <p>Check <NuxtLink to="/docs/getting-started/linking">our docs</NuxtLink> to find out how</p>
              </div>
            </Card>
          </div>
        </div>
      <div
          v-else
          class="card w-full">
        <h1>Your Account</h1>
        <Login/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import Login from "~/components/Login.vue";
import {useUserStore} from "~/stores/userStore";
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type PlayTimeResultInterface from "~/interfaces/PlayTimeResultInterface";
import appConfig from "~/app.config";

const {data: uuid} = await useFetch<string>('/api/user/uuid', {
  headers: {
    Authorization: useUserStore().token
  },
  cache: false
});

const { data, error, refresh } = await useFetch<PenguBotResponseInterface<PlayTimeResultInterface>|null>('/api/playtime', {
  immediate: true,
  query: {  uuid: uuid }
})

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(
      () => refresh(),
      appConfig.secondsToRefreshLookup * 1000
  )
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})

</script>