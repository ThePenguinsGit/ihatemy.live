<template>
  <div class="flex items-center gap-2.5">
    <!-- Beveled pixel "avatar": the user's initial, matching the GUI panels. -->
    <img
        v-if="user?.minecraftUuid"
        :src="`https://mc-heads.net/avatar/${user.minecraftUuid}?size=36`"
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
  </div>
</template>

<script setup lang="ts">
const { user } = useUserSession()
// Themed identity chip used in the navbar (desktop cluster + mobile menu).
defineProps<{
  level?: number | null;
}>();
</script>
