<template>
  <div id="background" class="w-full h-screen max-h-screen">
    <div class="w-full bg-secondary shadow-md py-4 px-2 flex flex-row h-24 top-0 z-10 place-content-between">
      <NuxtLink to="/"><img src="/img/logo.png" class="max-h-[70px]"  alt="Penguins Network"/></NuxtLink>
      <div class="mr-4 flex flex-col md:flex-row gap-5">
        <NuxtLink class="text-3xl block text-white leading-[2] hover:underline" to="/archive">Archive</NuxtLink>
        <NuxtLink class="text-3xl block text-white leading-[2] hover:underline" to="/docs">Docs</NuxtLink>
        <div v-if="useUserStore().isLoggedIn" class="flex flex-row gap-2">
          <span class="block leading-[2] text-3xl text-gray-600">{{useUserStore().name}}</span>
          <img class="rounded-full border-black border max-h-[40px] mt-3" :src="`https://cdn.discordapp.com/avatars/${useUserStore().avatar}.png`">
        </div>
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
  height: calc(100vh - 6rem);
}


</style>