<template>
  <Card variant="panel" class="items-start">
    <div class="flex justify-between w-full items-baseline gap-2">
      <div>
        <h1 class="font-[minecraft] uppercase">Your sessions</h1>
        <i v-if="data">{{ data.total }} logged · newest first</i>
        <i v-else>Loading…</i>
      </div>
      <div v-if="data && data.totalPages > 1" class="flex items-center gap-2 shrink-0">
        <PixelButton class="!py-1 text-sm" :disabled="page <= 1" @click="page--">←</PixelButton>
        <span class="font-[minecraft] text-sm whitespace-nowrap">{{ data.page }} / {{ data.totalPages }}</span>
        <PixelButton class="!py-1 text-sm" :disabled="page >= data.totalPages" @click="page++">→</PixelButton>
      </div>
    </div>

    <div class="w-full overflow-x-auto">
      <table class="pixel-table">
        <thead>
          <tr class="text-left">
            <th>Server</th>
            <th class="w-40">Started</th>
            <th class="w-28 text-right"></th>
            <th class="w-28 text-right">Duration</th>
          </tr>
        </thead>
        <tbody v-if="data && data.data.length">
          <tr v-for="session in data.data" :key="session.id">
            <td><b>{{ useServer(session.serverName).value?.displayName ?? session.serverName }}</b></td>
            <td class="font-mono" :title="formatAbsolute(session.start)">{{ formatRelative(session.start) }}</td>
            <td class="text-right whitespace-nowrap font-mono">
              <span class="text-alive" :title="`${session.advancementCount} advancements`">
                <span aria-hidden="true">⛏</span> {{ session.advancementCount }}
              </span>
              <span class="text-ded ml-2" :title="`${session.deathCount} deaths`">
                <span aria-hidden="true">☠</span> {{ session.deathCount }}
              </span>
            </td>
            <td class="text-right font-mono">
              <span
                v-if="session.end === null"
                class="inline-flex items-center gap-1.5 font-[minecraft] text-sm uppercase text-alive"
              >
                <span class="live-dot" />active
              </span>
              <template v-else>{{ formatDuration(session.start, session.end) }}</template>
            </td>
          </tr>
        </tbody>
        <tbody v-else-if="data">
          <tr>
            <td colspan="4" class="py-6! text-center">
              No sessions yet — hop on a server and come back!
            </td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="i in 6" :key="i">
            <td><Loading width="7em">&nbsp;</Loading></td>
            <td><Loading width="6em">&nbsp;</Loading></td>
            <td class="text-right"><Loading width="5em">&nbsp;</Loading></td>
            <td class="text-right"><Loading width="4em">&nbsp;</Loading></td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import type PaginatedResponseInterface from "~/interfaces/PaginatedResponseInterface";
import type SessionInterface from "~/interfaces/SessionInterface";

const page = ref(1)

const { data } = await useFetch<PaginatedResponseInterface<SessionInterface>>('/api/user/sessions', {
  query: { page },
})

const formatRelative = (unix: number) => useDayjs().unix(unix).fromNow()
const formatAbsolute = (unix: number) => useDayjs().unix(unix).format('LLLL')
const formatDuration = (start: number, end: number) => {
  // `end` is guaranteed non-null here — active sessions render a live badge instead.
  const totalMinutes = Math.max(0, Math.round((end - start) / 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
}
</script>
