<template>
  <div class="prose-table-scroll overflow-x-auto">
    <table>
      <slot />
    </table>
  </div>
</template>

<script setup lang="ts">
// Overrides the default MDC prose table so wide markdown tables scroll
// horizontally instead of overflowing the reading panel. Styling of the
// inner <table> comes from the `.content table` rules in main.css.
</script>
