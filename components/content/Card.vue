<template>
  <div class="card">
    <div class="card-content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  justify-content: center;
  align-items: center;
}
.card-content {
    width: 100%;
}
</style>