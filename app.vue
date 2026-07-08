<template>
    <div id="background" class="w-full h-screen max-h-screen">
      <SiteHeader />
      <div class="wrapper flex flex-col justify-between">
        <NuxtPage class="px-4 pt-4 pb-16 md:pb-4 " />
        <footer class="w-full bg-secondary border-t-4 border-ink py-1 text-center text-white text-sm font-[minecraft] uppercase tracking-wide shrink-0">
          <NuxtLink to="/legal/imprint" class="no-underline hover:text-ice">Imprint</NuxtLink>
          <span class="text-white/40 mx-2">·</span>
          <NuxtLink to="/legal/privacy" class="no-underline hover:text-ice">Privacy Policy</NuxtLink>
        </footer>
      </div>
    </div>
</template>

<style lang="scss">
@reference "~/assets/css/main.css";

/* Main styles */
body {
  background: url('/img/background.png') repeat fixed;
}

.wrapper {
  @apply overflow-y-auto;
  height: calc(100vh - 5rem); /* header is h-20 (5rem) */
}


</style>