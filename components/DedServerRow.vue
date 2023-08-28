<template>
  <div class="bg-white rounded-md drop-shadow-md flex flex-col md:flex-row items-center px-3 py-2 place-content-between">
    <div class="flex flex-row place-content-between w-full md:w-auto">
      <div class="self-center">
        <img
            :src="imagePath"
            class="image"
            :alt="name"
        />
      </div>
      <h2 class="text-3xl lg:text-3xl xl:text-[50px]">{{name}}</h2>
    </div>
    <div class="flex flex-row gap-2  place-content-between w-full md:w-auto">
      <div class="self-center">
        <Badge class="bg-sky-400 text-white" :title="reasonOfDeath">ded</Badge>
      </div>
      <a v-if="downloadPath" class="bg-blue-500 drop-shadow-sm px-3 py-1 rounded text-xl text-white hover:bg-blue-600 hover:drop-shadow-md transition-all" :href="downloadPath">Download Map as ZIP</a>
      <span v-else class="bg-blue-300 drop-shadow-sm px-3 py-1 rounded text-xl text-white">Download coming soon&trade;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string,
  downloadPath: null|string,
  imagePath: string,
  reasonOfDeath?: string,
}>()
</script>

<style scoped>

</style>