<template>
  <div class="bg-white rounded-md drop-shadow-md hover:drop-shadow-lg transition-all flex flex-row items-center px-3 py-0 place-content-between">
    <div class="flex flex-row">
      <div class="self-center">
        <img
            :src="imagePath"
            class="image"
            :alt="name"
        />
      </div>
      <div>
        <h2 class="text-[50px]">{{name}}</h2>
        <div role="doc-subtitle" class="relative -top-4 -mb-2 text-lg cursor-pointer hover:underline" title="Click to copy" @click="copyToClipboard">{{ hostname }}</div>
      </div>
    </div>
    <div class="flex flex-row gap-2">
      <div class="self-center">
        <Badge v-if="serverStats.online && serverStats.playersMax > 0" class="bg-indigo-400 text-white" title="barely">alive</Badge>
        <Badge v-else class="bg-red-600 text-white">(currently) ded</Badge>
      </div>
      <div v-if="mapUrl !== undefined">
        <a :href="mapUrl" class="bg-blue-500 drop-shadow-sm px-3 py-1 rounded text-xl text-white hover:bg-blue-600 hover:drop-shadow-md transition-all">Live Map</a>
      </div>
      <h2 v-if="serverStats.online && serverStats.playersMax > 0" class="text-2xl">{{ serverStats.playersOnline }} / {{ serverStats.playersMax }} Players</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string,
  hostname: string,
  imagePath: string,
  mapUrl?: undefined|string,
}>();
const { data: serverStats, refresh } = useFetch<McStatsResultInterface>(`https://api.ihatemy.live/?hostname=${props.hostname}`);
onMounted(() => {
  setInterval(() => refresh(), 3000);
});

const copyToClipboard = (event: PointerEvent) => {
  const target = event.target as HTMLDivElement|null;
  event.preventDefault();
  if (target === null) return;
  navigator.clipboard.writeText(target.innerText)
}
</script>
