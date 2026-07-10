<template>
  <header
    class="relative w-full bg-secondary border-b-4 border-ink h-20 px-4 md:px-5 flex items-center justify-between z-20 shrink-0"
  >
    <NuxtLink to="/" class="shrink-0" @click="open = false">
      <img src="/img/logo.png" class="max-h-[52px]" alt="The Penguin Network" />
    </NuxtLink>

    <!-- Desktop nav (md+) -->
    <nav
      class="hidden md:flex items-center gap-6 font-[minecraft] uppercase tracking-wide text-white text-2xl"
    >
      <template v-for="link in links" :key="link.label">
        <a
          v-if="link.href"
          :href="link.href"
          target="_blank"
          class="hover:text-ice transition-colors"
        >{{ link.label }}</a>
        <NuxtLink v-else :to="link.to!" class="hover:text-ice transition-colors">
          {{ link.label }}
        </NuxtLink>
      </template>

      <div v-if="loggedIn" class="flex items-center gap-4 pl-4 border-l-2 border-ink">
        <UserPlate :level="summary?.data.currentLevel" />
        <PixelButton
          danger
          class="!px-3 !py-1.5 text-xl"
          title="Log out"
          aria-label="Log out"
          @click="logout"
        >
          <PixelIcon name="logout" />
        </PixelButton>
      </div>
      <PixelButton v-else to="/login" primary class="!px-4 !py-1.5 text-sm">Log in</PixelButton>
    </nav>

    <!-- Mobile toggle (< md). Wrapped so `md:hidden` controls visibility: the
         .pixel-btn rule sets its own display, which would defeat md:hidden on
         the button itself. -->
    <div class="md:hidden">
      <button
        class="pixel-btn !p-0 w-11 h-11 text-2xl"
        :aria-expanded="open"
        aria-controls="mobile-menu"
        aria-label="Toggle menu"
        @click="open = !open"
      >
        <PixelIcon :name="open ? 'close' : 'menu'" />
      </button>
    </div>

    <!-- Mobile menu panel -->
    <Transition name="menu">
      <nav
        v-if="open"
        id="mobile-menu"
        class="md:hidden absolute top-20 inset-x-0 z-20 bg-secondary border-b-4 border-ink px-4 py-3 flex flex-col font-[minecraft] uppercase tracking-wide text-white text-xl"
      >
        <template v-for="link in links" :key="link.label">
          <a
            v-if="link.href"
            :href="link.href"
            target="_blank"
            class="block px-2 py-3 hover:bg-[var(--nav-hover)] hover:text-iceDeep transition-colors"
            @click="open = false"
          >{{ link.label }}</a>
          <NuxtLink
            v-else
            :to="link.to!"
            class="block px-2 py-3 hover:bg-[var(--nav-hover)] hover:text-iceDeep transition-colors"
          >{{ link.label }}</NuxtLink>
        </template>

        <div class="mt-3 pt-3 border-t-2 border-ink/60">
          <template v-if="loggedIn">
            <UserPlate :name="user?.name" :level="summary?.data.currentLevel" class="mb-3 px-2" />
            <PixelButton danger class="w-full justify-center" @click="logout">
              <PixelIcon name="logout" /> Log out
            </PixelButton>
          </template>
          <PixelButton v-else to="/login" primary class="w-full justify-center">Log in</PixelButton>
        </div>
      </nav>
    </Transition>
  </header>
</template>

<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession();
const { summary } = useAccountSummary();

// Single source for the primary nav links, rendered inline on desktop and
// stacked in the mobile menu. `href` → external (new tab); `to` → internal.
const links: { label: string; to?: string; href?: string }[] = [
  { label: 'The Graveyard', to: '/graveyard' },
  { label: 'Docs', to: '/docs/getting-started' },
  { label: 'Discord', href: '/discord' },
];

const open = ref(false);

// Close the mobile menu whenever the route changes (i.e. a link was followed).
const route = useRoute();
watch(() => route.fullPath, () => { open.value = false; });

const logout = async () => {
  open.value = false;
  await $fetch('/auth/logout', { method: 'POST' });
  await clear();
  await navigateTo('/');
};
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active {
    transition: none;
  }
}
</style>
