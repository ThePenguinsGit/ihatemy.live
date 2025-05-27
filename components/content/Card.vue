<template>
  <div class="card">
    <slot />
  </div>
</template>

<style>
@reference "~/assets/css/main.css";

.card {
  @apply overflow-x-auto;
}

.card > table {
  @apply w-full;
}
</style>