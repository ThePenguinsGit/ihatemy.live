<template>
  <Card variant="panel" class="flex flex-col p-0!">
    <!-- Header: pack art + name -->
    <div class="flex items-center gap-3 px-3 py-3 border-b-4 border-ink/10">
      <img :src="`/img/${server.shortName}.png`" :alt="server.displayName" class="w-12 h-12 shrink-0 object-cover" />
      <div class="min-w-0">
        <a v-if="server.packLink" :href="server.packLink" target="_blank">
          <h2 class="text-2xl leading-none truncate">{{ server.displayName }}</h2>
        </a>
        <h2 v-else class="text-2xl leading-none truncate">{{ server.displayName }}</h2>
        <div class="text-sm text-secondaryLight">
          Version {{ server.version }}<template v-if="server.packLink">
            ·
            <a
              :href="server.packLink"
              target="_blank"
              rel="noopener"
              class="underline hover:text-iceDeep"
              title="Get the modpack"
            >Pack ↗</a>
          </template><template v-if="server.releasedSince">
            ·
            <span :title="`Released ${$dayjs(server.releasedSince).local().format('DD.MM.YYYY')}`">{{ $dayjs(server.releasedSince).fromNow(true) }} old</span>
          </template>
        </div>
      </div>
      <div class="ml-auto shrink-0">
        <span
          v-if="server.online"
          class="inline-flex items-center gap-1.5 font-[minecraft] text-sm uppercase text-alive"
        >
          <span class="live-dot" />alive
        </span>
        <span v-else class="font-[minecraft] text-sm uppercase text-ded">ded</span>
      </div>
    </div>

    <!-- Tags -->
    <div v-if="server.tags.length" class="flex flex-wrap gap-1.5 px-3 pt-2">
      <span
        v-for="tag in server.tags"
        :key="tag"
        class="font-[minecraft] text-[10px] uppercase tracking-wider px-1.5 py-0.5 border-2 border-ink/15 text-secondaryLight"
      >{{ tag }}</span>
    </div>

    <!-- Body: IP + players -->
    <div class="flex items-center justify-between gap-2 px-3 py-2 grow">
      <div
        role="button"
        class="group text-left cursor-pointer"
        :title="copied ? 'Copied!' : 'Click to copy'"
        @click="copyHostname"
      >
        <div class="text-[11px] uppercase tracking-wider text-secondaryLight">Server IP</div>
        <div class="font-mono text-sm group-hover:text-iceDeep break-all">
          {{ hostname }}
          <span class="text-xs">{{ copied ? '✓' : '⧉' }}</span>
        </div>
      </div>
      <div v-if="online" class="text-right shrink-0">
        <div class="font-[minecraft] text-xl leading-none">{{ stats?.players.online ?? 0 }}<span class="text-secondaryLight text-sm">/{{ stats?.players.max ?? '?' }}</span></div>
        <div class="text-[11px] uppercase tracking-wider text-secondaryLight">online</div>
      </div>
    </div>

    <!-- Footer: live map -->
    <PixelButton
      v-if="online && !server.mapUnavailableReason"
      :href="`https://maps.ihatemy.live/${server.shortName}/`"
      class="w-full text-sm"
    >Live Map</PixelButton>
    <PixelButton
      v-else
      disabled
      :title="server.mapUnavailableReason ?? 'No map available'"
      class="w-full text-sm opacity-50 cursor-not-allowed"
    >{{ server.mapUnavailableReason ? 'No Map' : 'Live Map' }}</PixelButton>
  </Card>
</template>

<script setup lang="ts">
import type McStatsResultInterface from '~/interfaces/McStatsResultInterface';
import type ServerStatusInterface from "~/interfaces/ServerStatusInterface";

const props = defineProps<{
  server: ServerStatusInterface
  stats?: McStatsResultInterface | null;
}>();

const hostname = `${props.server.shortName}.ihatemy.live`

const online = computed(() => props.stats?.online === true && props.stats.players.max !== null);

const copied = ref(false);
const copyHostname = async () => {
  try {
    await navigator.clipboard.writeText(hostname);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    /* clipboard blocked — no-op */
  }
};
</script>
