<template>
  <div class="card flex flex-col md:flex-row place-content-between">
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
        <Badge class="bg-black text-white cursor-default" :title="reasonOfDeath">ded</Badge>
      </div>
      <a v-if="downloadPath" class="bg-secondary drop-shadow-sm px-3 py-1 rounded text-xl text-white hover:text-white hover:bg-secondaryLight hover:drop-shadow-md transition-all" :href="downloadPath">Download Map <span v-if="sizeInGigaBytes ?? 0 !== 0">({{sizeInGigaBytes}} GB)</span></a>
      <span v-else class="bg-blue-300 drop-shadow-sm px-3 py-1 rounded text-xl text-white cursor-progress">Download coming soon&trade;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string,
  downloadPath: null|string,
  contentLengthOfDownload: null|number,
  imagePath: string,
  reasonOfDeath: string,
}>()

const sizeInGigaBytes = Math.round(((props.contentLengthOfDownload ?? 0) / 1e+9 + Number.EPSILON) * 100) / 100
</script>