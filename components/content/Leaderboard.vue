<template>
  <Card class="items-start">
    <div class="flex justify-between">
      <div>
        <h1>Top {{ data?.data.length ?? 10 }}<span v-if="(data?.data.length ?? 0) < 10" title="For now">*</span></h1>
        <i>Of the last 30 days</i>
      </div>
      <div class="text-right">
        <Multiselect
            v-if="data"
            v-model="selectedServers"
            :options="servers ?? []"
            label="name"
            value-prop="value"
            mode="single"
            :hideSelected="false"
            placeholder="Select server"
        />
        <Loading v-else class="!block" height="42px" width="190px"/>
        <i v-if="data">Refreshed {{$dayjs(data?.time).local().format('DD.MM.YYYY HH:mm')}}</i>
        <i v-else>Loading...</i>
      </div>
    </div>
    <table class="pixel-table">
      <thead>
        <tr>
          <th class="w-10" />
          <th>Username</th>
          <th class="w-32">Playtime</th>
        </tr>
      </thead>
      <tbody v-if="data">
        <tr v-for="playTime in (data.data)" :key="playTime.uuid">
          <td class="w-14"><McHead :uuid="playTime.uuid" alt="Player Avatar" class="w-10" /></td>
          <td v-if="playTime.displayName !== null">
            <NuxtLink v-if="!hideLink" class="underline" :to="`?name=${playTime.displayName}`" rel=”nofollow”>
              <b :title="playTime.name">{{ playTime.displayName }}</b>
            </NuxtLink>
            <b v-else :title="playTime.name">{{ playTime.displayName }}</b>
            <i :title="playTime.name">*</i>
          </td>
          <td v-else>
            <NuxtLink v-if="!hideLink" class="underline" :to="`?name=${playTime.name}`" rel=”nofollow”>
              <b>{{ playTime.name }}</b>
            </NuxtLink>
            <b v-else>{{ playTime.name }}</b>
          </td>
          <td class="text-right">{{ formatTime(playTime.playtime) }}</td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-for="i in 10" :key="i">
          <td class="w-14"><Loading class="w-10 h-10"/></td>
          <td><Loading :width="new Rand((i * 1000).toString()).next() * 18 + 'em'">&nbsp;</Loading></td>
          <td class="text-right"><Loading :width="new Rand((i * 1000).toString()).next() * 6 + 'em'">&nbsp;</Loading></td>
        </tr>
      </tbody>
    </table>
  </Card>
</template>

<style src="@vueform/multiselect/themes/default.css"></style>

<style>
@reference "~/assets/css/main.css";

/* Pixel-panel reskin of @vueform/multiselect. The default theme above is
   variable-driven, so most of the look is retokenized here (panel surface,
   ink borders, zero radius); the rules below the block handle what the
   variables can't: the hard drop shadow, the pixel-btn-style focus outline,
   and a stepped pixel-art caret in place of the smooth triangle. */
.multiselect {
  --ms-font-size: 0.875rem;
  --ms-py: 0.4375rem;
  --ms-bg: var(--panel-surface);
  --ms-border-color: var(--panel-border);
  --ms-border-width: 3px;
  --ms-border-color-active: var(--panel-border);
  --ms-border-width-active: 3px;
  --ms-radius: 0;
  --ms-placeholder-color: var(--color-secondaryLight);
  --ms-caret-color: var(--color-ink);
  --ms-clear-color: var(--color-secondaryLight);
  --ms-clear-color-hover: var(--color-ded);
  --ms-spinner-color: var(--color-iceDeep);

  --ms-dropdown-bg: var(--panel-surface);
  --ms-dropdown-border-color: var(--panel-border);
  --ms-dropdown-border-width: 3px;
  --ms-dropdown-radius: 0;

  --ms-option-font-size: 0.875rem;
  --ms-option-bg-pointed: var(--color-secondaryLight);
  --ms-option-color-pointed: white;
  --ms-option-bg-selected: var(--color-secondary);
  --ms-option-color-selected: white;
  --ms-option-bg-selected-pointed: color-mix(in srgb, var(--color-secondary) 85%, white);
  --ms-option-color-selected-pointed: white;
  --ms-empty-color: var(--color-secondaryLight);

  @apply font-[minecraft] uppercase tracking-wide text-left;
  box-shadow: 0 4px 0 var(--panel-drop);
}

/* The theme's focus ring is a soft box-shadow that would replace the hard
   drop; keep the drop and signal focus like .pixel-btn instead. */
.multiselect.is-active {
  box-shadow: 0 4px 0 var(--panel-drop);
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}

.multiselect-dropdown {
  @apply overflow-y-auto;
  box-shadow: 0 4px 0 var(--panel-drop);
}

/* Stepped pixel chevron (blocky, like PixelIcon glyphs). */
.multiselect-caret {
  -webkit-mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 4' shape-rendering='crispEdges'%3E%3Crect x='0' y='0' width='8' height='1'/%3E%3Crect x='1' y='1' width='6' height='1'/%3E%3Crect x='2' y='2' width='4' height='1'/%3E%3Crect x='3' y='3' width='2' height='1'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 4' shape-rendering='crispEdges'%3E%3Crect x='0' y='0' width='8' height='1'/%3E%3Crect x='1' y='1' width='6' height='1'/%3E%3Crect x='2' y='2' width='4' height='1'/%3E%3Crect x='3' y='3' width='2' height='1'/%3E%3C/svg%3E");
  width: 0.875rem;
  transition: none;
}
</style>

<script lang="ts" setup>
import appConfig from "~/app.config";
import type LeaderboardResultRowInterface from "~/interfaces/LeaderboardResultRowInterface";
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import type ServerResponse from "~/interfaces/ServerResponse";
import Multiselect from '@vueform/multiselect'
import Rand from "rand-seed";

defineProps<{
  hideLink?: boolean
}>()

const selectedServers = ref<string>()

const { data: servers } = useApiFetch<ServerResponse[]>('/servers')
const formatTime = (time: number) => useDayjs().duration(time, 'seconds').as('hours').toFixed(2) + ' h'

const { data, refresh } = await useApiFetch<PenguBotResponseInterface<LeaderboardResultRowInterface[]>|null>('/leaderboard', {
  query: {
    'servers[]': selectedServers
  }
})

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(refresh, appConfig.secondsToRefreshLeaderBoard * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})
</script>