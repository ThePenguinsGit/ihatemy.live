<script setup lang="ts">
defineProps<{
  uuid: string
  alt?: string
}>()
</script>

<template>
  <img :src="`https://mc-heads.net/avatar/${uuid}`" :alt="alt" />
</template>

<style scoped>

</style>