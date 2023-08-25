<template>
  <div class="bg-white rounded-md drop-shadow-md hover:drop-shadow-lg transition-all flex flex-row items-center px-3 py-0 place-content-between">
    <div class="flex flex-row">
      <div class="self-center">
        <nuxt-img
            :src="imagePath"
            sizes="sm:50px"
        />
      </div>
      <h2 class="text-[50px]">{{name}}</h2>
    </div>
    <div class="flex flex-row gap-2">
      <div class="self-center">
        <Badge v-if="serverStats.online" class="bg-indigo-400 text-white">alive</Badge>
        <Badge v-else class="bg-red-600 text-white">(currently) ded</Badge>
      </div>
      <h2 v-if="serverStats.online" class="text-2xl">{{ serverStats?.playerOnline }} / {{ serverStats.playersMax }} Players</h2>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string,
  hostname: string,
  imagePath: string,
}>();
// const { data: serverStats } = await useFetch<McStatsResultInterface>(`/api/mcStats?host=${props.hostname}`);
const serverStats = {
  online: false,
  playerOnline: null,
  playersMax: null,
}
</script>

<script lang="ts">

</script>

<style scoped>

</style>