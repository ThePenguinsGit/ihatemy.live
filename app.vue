<template>
  <div id="background" class="w-full h-screen max-h-screen">
    <div class="w-full bg-secondary shadow-md py-4 px-2 flex flex-row h-24 top-0 z-10 place-content-between">
      <NuxtLink to="/"><img src="/img/logo.png" class="max-h-[70px]"  alt="Penguins Network"/></NuxtLink>
      <div class="mr-4">
        <NuxtLink class="text-3xl block text-white leading-[2] hover:underline" to="/docs/getting-started">Docs</NuxtLink>
      </div>
    </div>
    <div class="wrapper flex flex-col justify-between">
      <NuxtPage class="px-4 pt-4 pb-16 md:pb-4 " />
      <div class="w-full bg-secondary h-6 text-center text-white text-md">
        <div class="mx-auto">
          <NuxtLink to="/legal/imprint" class="no-underline">Imprint</NuxtLink>
          -
          <NuxtLink to="/legal/privacy" class="no-underline">Privacy Policy</NuxtLink>
        </div>
      </div>
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

/* Main styles */
body {
  background: url('/img/background.png') repeat fixed;
}

.wrapper {
  @apply overflow-y-auto;
  height: calc(100vh - 6rem);
}


</style>