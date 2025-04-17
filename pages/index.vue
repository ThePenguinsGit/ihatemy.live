<template>
  <div class="px-5 flex flex-col gap-3">
    <iframe src="https://ko-fi.com/streamalerts/goaloverlay/sa_ed47c804-d1a7-4e42-ba00-1edff9d3e40d" height="57" class="-mb-1" />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="flex flex-col gap-5 w-full">
        <AliveServerRow name="All The Mods 10" version="2.43" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="All The Mods 9" version="1.0.7" image-path="/img/atm9.png" hostname="atm9.ihatemy.live" mapUrl='https://atm9.ihatemy.live'/>
      </div>
      <div
        class="flex flex-col gap-2">
        <div class="card w-full flex flex-row justify-between"
             v-if="useUserStore().isLoggedIn">
          <h1 class="block">Your Account</h1>
          <div class="flex flex-row gap-2">
            <span class="block text-3xl text-gray-600">{{useUserStore().name}}</span>
            <img class="rounded-full border-black border max-h-[40px]" :src="`https://cdn.discordapp.com/avatars/${useUserStore().avatar}.png`">
          </div>
        </div>
        <div v-if="!useUserStore().isLoggedIn" class="flex flex-col gap-2">
          <div
              class="card w-full">
            <h1>what the FUCK is this?</h1>
          </div>
          <div class="card">
            <h2>Welcome to the PemguimNetwork</h2>
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 h-[33rem]">
          <NickSetting :uuid="minecraftUuid" />
          <Card>
            <PlayerLookupDetails v-if="data" :data="data" :donator-status="data.renderedDonatorPrefix" />
            <div v-else>
              <h2>No data available</h2>
              <p>Make sure you have linked your Minecraft Account to your Discord Account.</p>
              <p>Check <NuxtLink to="/docs/getting-started/linking">our docs</NuxtLink> to find out how</p>
            </div>
          </Card>
        </div>
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

const randomElement = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

const {data: publicUuids } = await useFetch<string[]>('/api/public-uuids');
const randomUuid =  ref<string>(randomElement(publicUuids.value ?? []))

const {data: uuid} = await useFetch<string>('/api/user/uuid', {
  headers: {
    Authorization: useUserStore().token
  },
  cache: false
});



const minecraftUuid = computed(() => {
  return useUserStore().isLoggedIn
    ? uuid
    : randomUuid
})

const { data, error, refresh } = await useFetch<PenguBotResponseInterface<PlayTimeResultInterface>|null>('/api/player-profile', {
  immediate: true,
  query: {  uuid: minecraftUuid.value },
})

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(
      () => {
        randomUuid.value = randomElement(publicUuids.value ?? [])
        refresh()
      },
      appConfig.secondsToRefreshLookup * 1000
  )
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})

</script>