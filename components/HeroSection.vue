<template>
  <Card as="section" variant="dark" class="overflow-hidden">
    <div class="relative flex flex-row items-center gap-4 ">
      <div class="flex flex-col gap-2 max-w-3xl">
        <div>
          <span class="eyebrow">The Penguin Network</span>
          <h1 class="font-[minecraft] text-2xl md:text-4xl leading-none">
            Pick a world. Get sacrificed.
          </h1>
          <p class="text-white/80 leading-snug">
            Join our chaos on one of the {{ totalServers }} modded servers.<br>
            Or hold a cult gathering on our Discord first.
          </p>
        </div>
        <div>
        </div>

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
          <span class="flex items-center gap-2 font-[minecraft]">
            <span class="live-dot" />
            {{ onlinePlayers }} playing
            <span class="text-white/40">·</span>
            <span :class="serversUp === totalServers ? 'text-ice' : 'text-white/80'">
              {{ serversUp }}/{{ totalServers }} servers up
            </span>
          </span>
          <PixelButton :href="discordUrl" primary class="!py-1.5">
            Join the Discord
          </PixelButton>
          <PixelButton to="/docs/getting-started" class="!py-1.5">
            Get started
          </PixelButton>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
defineProps<{
  onlinePlayers: number;
  serversUp: number;
  totalServers: number;
}>();

const discordUrl = useRuntimeConfig().public.discordUrl;
</script>
