<template>
  <div class="card">
    <slot />
  </div>
</template>

<style>
.card {
  @apply overflow-x-auto;
}

.card > table {
  @apply w-full;
}
</style>