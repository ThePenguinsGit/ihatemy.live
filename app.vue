<template>
    <div id="background" class="w-full h-screen max-h-screen">
      <header class="w-full bg-secondary border-b-4 border-ink h-20 px-4 md:px-5 flex items-center justify-between top-0 z-10 shrink-0">
        <NuxtLink to="/" class="shrink-0"><img src="/img/logo.png" class="max-h-[52px]" alt="The Penguin Network"/></NuxtLink>
        <nav class="flex items-center gap-4 md:gap-6 font-[minecraft] uppercase tracking-wide text-white text-lg md:text-2xl">
          <NuxtLink class="hover:text-ice transition-colors" to="/graveyard">The Graveyard</NuxtLink>
          <NuxtLink class="hover:text-ice transition-colors" to="/docs/getting-started">Docs</NuxtLink>
          <a class="hidden sm:block hover:text-ice transition-colors" href="/discord" target="_blank">Discord</a>
          <div class="flex flex-row" v-if="loggedIn">
            <NuxtLink
              to="/"
              class="flex items-center gap-3 pl-1 md:border-l-2 md:border-ink md:pl-4 group"
            >
              <span class="hidden sm:block text-right leading-tight normal-case tracking-normal ">
                <span class="block text-ice text-base no-underline">{{ user?.name }}</span>
                <span v-if="summary" class="block text-white/60 text-xs text-decorat">
                  Lvl {{ summary.data.currentLevel }}
                </span>
              </span>
            </NuxtLink>
            <NuxtLink
              @click="logout()"
              class="hidden sm:inline-block hover:text-ice transition-colors cursor-pointer"
            >
              Log out
            </NuxtLink>
          </div>
          <PixelButton v-else to="/login" primary class="!px-4 !py-1.5 text-sm">Log in</PixelButton>
        </nav>
      </header>
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
<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
const { summary } = useAccountSummary();

const logout = async () => {
  await $fetch('/auth/logout', { method: 'POST' });
  await clear();
  await navigateTo('/');
};
</script>

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