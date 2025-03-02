<template>
  <div id="background" class="w-full h-screen max-h-screen">
    <div class="w-full bg-secondary shadow-md py-4 px-2 flex flex-row h-24 top-0 z-10 place-content-between">
      <NuxtLink to="/"><img src="/img/logo.png" class="max-h-[70px]"  alt="Penguins Network"/></NuxtLink>
      <div class="mr-4">
        <NuxtLink class="text-3xl block text-white leading-[2] hover:underline" to="/docs">Docs</NuxtLink>
      </div>
    </div>
    <div class="pb-14 wrapper">
      <NuxtPage class="p-4 overflow-y-auto" />
    </div>
  </div>
</template>
<script setup lang="ts">
onMounted(() => {
  window.kofiWidgetOverlay.draw('penguinnetwork', {
      'type': 'floating-chat',
      'floating-chat.donateButton.text': 'Support us',
      'floating-chat.donateButton.background-color': '#2B303A',
      'floating-chat.donateButton.text-color': '#fff'
    });
});
</script>

<style lang="scss">
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
body {
  background: url('/img/background.png') repeat fixed;
  -webkit-animation: bg-scrolling 5s infinite;
  -moz-animation:    bg-scrolling 5s infinite;
  -o-animation:      bg-scrolling 5s infinite;
  animation:         bg-scrolling 5s infinite;
  -webkit-animation-timing-function: linear;
  -moz-animation-timing-function:    linear;
  -o-animation-timing-function:      linear;
  animation-timing-function:         linear;
}

.wrapper {
  @apply overflow-y-auto;
  height: calc(100vh - 6.5rem);
}

</style>