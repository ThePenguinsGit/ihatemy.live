<template>
  <div class="px-5 flex flex-col gap-3">
<!--    <iframe src="https://ko-fi.com/streamalerts/goaloverlay/sa_ed47c804-d1a7-4e42-ba00-1edff9d3e40d" height="57" class="-mb-1" />-->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div class="flex flex-col gap-5 w-full">
        <AliveServerRow name="ATM10: To the Sky" version="2.0.2" image-path="/img/atm10tts.png" hostname="atm10tts.ihatemy.live" mapUrl='https://maps.ihatemy.live/atm10tts'/>
        <AliveServerRow name="All The Mods 10" version="7.1" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://maps.ihatemy.live/atm10'/>
        <AliveServerRow name="GregTech: New Horizons" version="2.8.4" image-path="/img/gtnh.png" hostname="gtnh.ihatemy.live" mapUrl='https://maps.ihatemy.live/gtnh'/>
        <AliveServerRow name="MC Eternal 2" version="1.2.2.0" image-path="/img/mce2-2.png" hostname="mce2.ihatemy.live" mapUrl='https://maps.ihatemy.live/mce2'/>
        <AliveServerRow name="Prominence 2" version="3.9.27" image-path="/img/p2he.png" hostname="p2he.ihatemy.live" mapUrl='https://maps.ihatemy.live/p2he'/>
        <AliveServerRow name="StoneBlock 4" version="1.15.3" image-path="/img/sb4.png" hostname="sb4.ihatemy.live" mapUnavailableReason="It's underground, duh"/>
        <AliveServerRow name="Society: Sunlit Valley" version="4.0.8" image-path="/img/sv.png" hostname="sv.ihatemy.live" mapUrl='https://maps.ihatemy.live/sv'/>
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 h-132">
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
import {useUserStore} from "~/stores/userStore";
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type PlayTimeResultInterface from "~/interfaces/PlayTimeResultInterface";
import appConfig from "~/app.config";

useHead({
  title: `The Penguin Network`,
  meta: [
    {
      name: 'description',
      content: 'Welcome to The Penguin Network - A friendly modded Minecraft community perfect for new and experienced players! Join our active servers including ATM10: To the Sky, All The Mods 10, GregTech: New Horizons, MC Eternal 2, Prominence 2, and Society: Sunlit Valley. Everyone is welcome!'
    },
  ],
})

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