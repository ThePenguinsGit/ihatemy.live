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
      <h2 class="text-[50px]">{{name}}</h2>
    </div>
    <div class="flex flex-row gap-2">
      <div class="self-center">
        <Badge v-if="serverStats.online && serverStats.playersMax > 0" class="bg-indigo-400 text-white" title="barely">alive</Badge>
        <Badge v-else class="bg-red-600 text-white">(currently) ded</Badge>
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
}>();
const { data: serverStats, refresh } = useFetch<McStatsResultInterface>(`https://api.ihatemy.live/?hostname=${props.hostname}`);

setInterval(() => refresh(), 3000);
</script>
