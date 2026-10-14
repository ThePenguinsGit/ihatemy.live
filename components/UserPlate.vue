<template>
  <div class="flex items-center gap-2.5">
    <!-- Beveled pixel "avatar": the user's initial, matching the GUI panels. -->
    <McHead
        v-if="user?.minecraftUuid"
        :uuid="user.minecraftUuid"
        :alt="user.name"
        aria-hidden="true"
        class="grid place-items-center w-9 h-9 shrink-0 border-2 border-ink bg-secondaryLight font-[minecraft] text-ice text-lg leading-none"
     />
    <span class="leading-tight min-w-0">
      <span class="block truncate text-ice text-base normal-case tracking-normal">{{ user.name }}</span>
      <span v-if="level != null" class="block text-white/55 text-[11px] uppercase tracking-wider">
        Lvl {{ level }}
      </span>
    </span>
    <!-- Friend requests + party invites waiting on an answer -->
    <NuxtLink
      v-if="pendingCount > 0"
      to="/#people"
      class="font-[minecraft] text-sm leading-none px-1.5 py-1 text-ink bg-beak hover:bg-beakDark border-2 border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ice"
      :aria-label="`${pendingCount} friend ${pendingCount === 1 ? 'request or party invite' : 'requests and party invites'} waiting`"
    >{{ pendingCount > 9 ? '9+' : pendingCount }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
const { user } = useUserSession()
const { pendingCount } = useSocial()
// Themed identity chip used in the navbar (desktop cluster + mobile menu).
defineProps<{
  level?: number | null;
}>();
</script>
