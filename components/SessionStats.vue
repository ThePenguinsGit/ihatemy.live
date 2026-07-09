<template>
  <Card variant="panel" class="flex flex-col gap-4">
    <div class="flex justify-between items-baseline gap-2">
      <h2 class="font-[minecraft] uppercase text-lg">Lifetime stats</h2>
      <i v-if="data && data.activeSince !== null">playing since {{ formatSince(data.activeSince) }}</i>
      <i v-else-if="!data">Loading…</i>
    </div>

    <template v-if="!data">
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card variant="dark" class="flex flex-col gap-2">
          <Loading width="6em" height="2.5em" />
          <Loading width="8em" />
        </Card>
        <Card v-for="i in 3" :key="i" class="flex flex-col gap-2 justify-center">
          <Loading width="4em" height="1.75em" />
          <Loading width="6em" />
        </Card>
      </div>
      <Card class="flex items-center gap-3">
        <Loading width="2.5em" height="2.5em" />
        <Loading width="10em" />
      </Card>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card v-for="i in 2" :key="i" class="flex flex-col gap-2">
          <Loading width="3em" height="1.75em" />
          <Loading width="7em" />
        </Card>
      </div>
    </template>

    <div v-else-if="data.sessionCount === 0" class="flex flex-col gap-2 items-center text-center py-6">
      <h3 class="font-[minecraft] uppercase text-xl">No sessions yet</h3>
      <p>Your stats start filling up the moment you log in — hop on a server.</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card variant="dark" class="flex flex-col items-center text-center justify-center gap-1">
          <div class="font-[minecraft] text-3xl text-beak leading-none">{{ formatDuration(data.totalPlaytime) }}</div>
          <div class="text-xs uppercase tracking-wider text-white/60">total played</div>
          <div class="text-sm text-ice">≈ {{ mcDays.toLocaleString() }} Minecraft days</div>
        </Card>

        <!-- Supporting tiles -->
        <Card class="flex flex-col items-center text-center justify-center gap-1">
          <div class="font-[minecraft] text-2xl leading-none">{{ data.sessionCount.toLocaleString() }}</div>
          <div class="text-xs uppercase tracking-wider text-secondaryLight">sessions played</div>
        </Card>
        <Card class="flex flex-col items-center text-center justify-center gap-1">
          <div class="font-[minecraft] text-2xl leading-none">{{ formatAverageSession(data.averageSessionPlaytime) }}</div>
          <div class="text-xs uppercase tracking-wider text-secondaryLight">avg session</div>
        </Card>
        <Card class="flex flex-col items-center text-center justify-center gap-1">
          <div class="font-[minecraft] text-2xl leading-none">{{ data.distinctServers.toLocaleString() }}</div>
          <div class="text-xs uppercase tracking-wider text-secondaryLight">servers explored</div>
        </Card>
      </div>

      <Card class="flex items-center gap-3">
        <template v-if="data.favouriteServer">
          <img
            :src="`/img/${data.favouriteServer.serverName}.png`"
            :alt="favouriteServerDisplayName"
            class="w-10 h-10 shrink-0 object-cover"
          >
          <div class="min-w-0">
            <div class="font-[minecraft] uppercase capitalize truncate">{{ favouriteServerDisplayName }}</div>
            <div class="text-sm text-secondaryLight">{{ formatDuration(data.favouriteServer.playtime) }} this month</div>
          </div>
          <div class="ml-auto shrink-0 text-xs uppercase tracking-wider text-secondaryLight">favourite server</div>
        </template>
        <template v-else>
          <div class="text-secondaryLight">No favourite yet</div>
        </template>
      </Card>

      <!-- Signature pair: advancements vs deaths -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card class="flex items-center gap-3 border-l-4! border-l-alive!">
          <PixelIcon name="advancement" class="text-2xl text-alive shrink-0" />
          <div>
            <div class="font-[minecraft] text-xl leading-none">{{ data.advancements.total.toLocaleString() }}</div>
            <div class="text-xs uppercase tracking-wider text-secondaryLight">
              {{ formatAvg(data.advancements.averagePerSession) }} / session · advancements
            </div>
          </div>
        </Card>
        <Card class="flex items-center gap-3 border-l-4! border-l-ded!">
          <PixelIcon name="death" class="text-2xl text-ded shrink-0" />
          <div>
            <div class="font-[minecraft] text-xl leading-none">{{ data.deaths.total.toLocaleString() }}</div>
            <div class="text-xs uppercase tracking-wider text-secondaryLight">
              {{ formatAvg(data.deaths.averagePerSession) }} / session · deaths
            </div>
          </div>
        </Card>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type SessionStatsInterface from "~/interfaces/SessionStatsInterface";

const { data } = await useFetch<SessionStatsInterface>('/api/user/sessions/stats', { server: false })

const favouriteServerDisplayName = computed(() =>
    useServer(data.value?.favouriteServer?.serverName ?? '').value?.displayName
    ?? data.value?.favouriteServer?.serverName
)

// 1 in-game Minecraft day = 20 real-world minutes.
const mcDays = computed(() => Math.floor((data.value?.totalPlaytime ?? 0) / 1200))

const formatDuration = (totalSeconds: number): string => {
  const totalMinutes = Math.max(0, Math.round(totalSeconds / 60))
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

const formatAverageSession = (seconds: number | null): string => seconds === null ? '—' : formatDuration(seconds)
const formatAvg = (value: number | null): string => value === null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
const formatSince = (unix: number): string => useDayjs().unix(unix).format('MMM YYYY')
</script>
