<template>
  <div class="row flex flex-col md:flex-row gap-2">
    <slot />
  </div>
</template>

<style>
.row > p {
  @apply flex flex-col md:flex-row gap-2;
}
</style>