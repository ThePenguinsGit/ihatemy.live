<template>
  <div id="background" class="w-full min-h-screen bg-[url('/img/background.png')] bg-repeat">
    <div class="w-full bg-red-300 shadow-md py-4 px-2 flex flex-row">
      <nuxt-img src="/img/crab.png" provider="ipx" sizes="sm:50px"/>
      <h1 class="text-[50px] ml-4 -mt-1">The Penguins</h1>
    </div>
    <NuxtPage />
  </div>
</template>
<script setup lang="ts">
</script>

<style scoped lang="scss">
$bg-width: -264px;
$bg-height: 141px;

@-webkit-keyframes bg-scrolling {
  0% { background-position: $bg-width $bg-height; }
}
@-moz-keyframes    bg-scrolling {
  0% { background-position: $bg-width $bg-height; }
}
@-o-keyframes      bg-scrolling {
  0% { background-position: $bg-width $bg-height; }
}
@keyframes         bg-scrolling {
  0% { background-position: $bg-width $bg-height; }
}

/* Main styles */
#background {
  -webkit-animation: bg-scrolling 5s infinite;
  -moz-animation:    bg-scrolling 5s infinite;
  -o-animation:      bg-scrolling 5s infinite;
  animation:         bg-scrolling 5s infinite;
  -webkit-animation-timing-function: linear;
  -moz-animation-timing-function:    linear;
  -o-animation-timing-function:      linear;
  animation-timing-function:         linear;
}
</style>