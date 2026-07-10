<template>
  <Card class="flex flex-col md:flex-row items-center gap-3 md:justify-between">
    <div class="flex items-center gap-3 w-full md:w-auto">
      <img :src="imagePath" class="w-12 h-12 object-cover grayscale opacity-75 shrink-0" :alt="name"/>
      <div class="min-w-0">
        <h2 class="text-2xl md:text-3xl leading-none">{{ name }}</h2>
        <div class="text-sm text-secondaryLight italic truncate">“{{ reasonOfDeath }}”</div>
      </div>
    </div>
    <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end shrink-0">
      <span class="font-[minecraft] uppercase text-sm text-ded" title="rest in pieces">† ded</span>
      <PixelButton v-if="downloadPath" :href="downloadPath" class="text-sm">
        Download Map <span v-if="(sizeInGigaBytes ?? 0) !== 0" class="normal-case opacity-80">({{ sizeInGigaBytes }} GB)</span>
      </PixelButton>
      <PixelButton v-else disabled class="text-sm opacity-50 cursor-progress">Download soon&trade;</PixelButton>
    </div>
  </Card>
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