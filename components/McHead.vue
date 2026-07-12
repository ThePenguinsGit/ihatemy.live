<script setup lang="ts">
const props = defineProps<{
  uuid: string
  alt?: string
}>()

const img = ref<HTMLImageElement>()
const loaded = ref(false)

onMounted(() => {
  if (img.value?.complete) loaded.value = true
})

watch(() => props.uuid, () => {
  loaded.value = false
})
</script>

<template>
  <div class="relative aspect-square overflow-hidden">
    <Loading v-if="!loaded" class="absolute inset-0" />
    <img
      v-show="loaded"
      ref="img"
      :src="`https://crafthead.net/avatar/${uuid}`"
      :alt="alt"
      class="w-full h-full"
      @load="loaded = true"
      @error="loaded = true"
    />
  </div>
</template>

<style scoped>

</style>
