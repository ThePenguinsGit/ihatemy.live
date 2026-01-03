<script setup lang="ts">
defineProps<{
  width?: string;
  height?: string
}>()

</script>

<template>
  <div class="rounded-md animate-pulse bg-secondary inline-block" :style="{width, height}">&nbsp;</div>
</template>

<style scoped>

</style>