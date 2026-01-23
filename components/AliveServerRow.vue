<template>
  <div class="card flex flex-col lg:flex-row items-center px-3 py-0 place-content-between">
    <div class="flex flex-row place-content-between w-full text-right md:text-left lg:w-auto">
      <div class="self-center">
        <img
            :src="imagePath"
            class="image"
            :alt="name"
        />
      </div>
      <div>
        <h2 class="text-[40px] md:text-[50px] leading-none">{{name}}</h2>
        <div class="relative text-lg cursor-pointer hover:underline"><span title="Click to copy" @click="copyToClipboard">{{ hostname }}</span> (Version {{ version }})</div>
      </div>
    </div>
    <div class="flex flex-col gap-2 w-full lg:w-auto" v-if="serverStats !== undefined">
      <div class="flex flex-row gap-2 place-content-between">
        <div class="self-center">
          <Badge v-if="serverStats.online && serverStats.players.max !== null" class="bg-green-600 text-white" title="barely">alive</Badge>
          <Badge v-else class="bg-red-600 text-white">(currently) ded</Badge>
        </div>
        <h2 v-if="serverStats.online && serverStats.players.max !== null" class="text-2xl">{{ serverStats.players.online }} / {{ serverStats.players.max }} Players</h2>
      </div>
      <a :href="mapUrl" target="_blank" class="block"><button v-if="mapUrl !== undefined && serverStats.online" class="w-full bg-secondary text-white px-2 py-1 rounded-md">Live Map</button></a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type McStatsResultInterface from '~/interfaces/McStatsResultInterface';

const props = defineProps<{
  name: string,
  hostname: string,
  imagePath: string,
  mapUrl?: undefined|string,
  version: string,
}>();
const { data: serverStats, refresh } = useApiFetch<McStatsResultInterface>(`/server-status?hostname=${props.hostname}`);

let interval: ReturnType<typeof setInterval>
onNuxtReady(() => {
  interval = setInterval(() => refresh(), 10000);
});
onBeforeUnmount(() => {
  window.clearInterval(interval)
})

const copyToClipboard = (event: MouseEvent) => {
  const target = event.target as HTMLDivElement|null;
  event.preventDefault();
  if (target === null) return;
  navigator.clipboard.writeText(target.innerText)
}
</script>
