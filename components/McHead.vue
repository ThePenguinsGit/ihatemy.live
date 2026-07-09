<script setup lang="ts">
defineProps<{
  uuid: string
  alt?: string
}>()
</script>

<template>
  <img :src="`https://crafthead.net/avatar/${uuid}`" :alt="alt" />
</template>

<style scoped>

</style>