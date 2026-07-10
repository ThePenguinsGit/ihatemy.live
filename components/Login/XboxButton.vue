<script setup lang="ts">
defineProps<{
  sublabel?: string
}>()
</script>

<template>
  <ProviderButton
      href="/auth/xbox"
      label="Continue with Xbox"
      :sublabel="sublabel"
      brand="#107C10"
      class="max-w-md"
  >
    <template #icon>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M4.102 21.033A11.947 11.947 0 0 0 12 24a11.96 11.96 0 0 0 7.902-2.967c1.877-1.912-4.316-8.708-7.902-11.417-3.582 2.71-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912A11.949 11.949 0 0 0 24 12.004a11.94 11.94 0 0 0-3.57-8.536s-.027-.022-.082-.042c-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.041A11.94 11.94 0 0 0 0 12.004c0 2.508.771 4.836 2.084 6.762C.676 16.167 5.66 8.815 8.16 5.854 5.342 3.045 3.95 2.61 3.357 2.61c-.129 0-.216.017-.27.043zM12 3.09C10.31 1.482 5.924.001 5.924.001 12 0 12 0 12 0s6.076.001 6.076.001S13.69 1.482 12 3.09z"/>
      </svg>
    </template>
  </ProviderButton>
</template>

<style scoped>

</style>