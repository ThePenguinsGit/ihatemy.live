<template>
  <span
    v-if="meta"
    class="inline-flex items-center gap-2 border-2 border-ink bg-snow px-2 py-1 font-[minecraft] text-sm uppercase tracking-wide"
    :title="`Supporter tier: ${meta.name}`"
  >
    <img v-if="meta.image" :src="meta.image" :alt="meta.name" class="w-5 h-5 object-contain" />
    <span v-else aria-hidden="true">★</span>
    {{ meta.name }}
  </span>
  <!-- Supporter tiers live on Discord — without a connected Discord account we can't know theirs. -->
  <a
    v-else-if="!hasDiscord"
    href="/auth/discord"
    class="inline-flex items-center gap-2 border-2 border-dashed border-secondaryLight text-secondaryLight px-2 py-1 font-[minecraft] text-sm uppercase tracking-wide hover:border-ice hover:text-ice"
    title="Supporter tiers come from Discord — log in with Discord or link your accounts to show yours"
  >
    Log in with Discord to see your tier
  </a>
  <span
    v-else
    class="inline-flex items-center gap-2 border-2 border-dashed border-secondaryLight text-secondaryLight px-2 py-1 font-[minecraft] text-sm uppercase tracking-wide"
  >
    No supporter tier
  </span>
</template>

<script setup lang="ts">
import { tierMeta, type DonationTier } from '~/data/donationTiers';

const { user } = useUserSession();
const meta = computed(() => tierMeta((user.value?.donatorGroup ?? null) as DonationTier | null));
const hasDiscord = computed(() => !!user.value?.discordSnowflake);
</script>
