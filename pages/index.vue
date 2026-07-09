<template>
  <div class="flex flex-col gap-8 max-w-7xl mx-auto w-full">
    <HeroSection
        v-if="servers"
      :online-players="onlinePlayers"
      :servers-up="serversUp"
      :total-servers="servers?.length"
    />

    <!-- ── Servers ──────────────────────────────────────────── -->
    <section>
      <SectionHeading title="Servers" eyebrow="The graveyard →" to="/graveyard" />
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <ServerCard
          v-for="server in servers"
          :key="server.shortName"
          v-bind="server"
          :stats="statuses[server.shortName]"
        />
      </div>
    </section>

    <!-- ── Your account / customize ─────────────────────────── -->
    <section>
      <SectionHeading
        :title="isLoggedIn ? 'Your account' : 'Make it yours'"
        :eyebrow="isLoggedIn ? undefined : 'log in to save your nick'"
        :to="isLoggedIn ? undefined : '/auth/discord'"
        target="_blank"
      >
        <template #eyebrow>
          <SubscriptionTier v-if="isLoggedIn" />
        </template>
      </SectionHeading>

      <div class="grid grid-cols-1 gap-4 items-stretch">
        <NickSetting :uuid="minecraftUuid" />
        <PlayerProfileCard
          v-if="data"
          :data="data"
        />
        <Card v-else variant="panel" class="p-4">
          <div class="flex flex-col gap-2 justify-center h-full text-center">
            <h2 class="font-[minecraft] uppercase">No stats yet</h2>
            <p>Link your Minecraft account to your Discord to see playtime and levels.</p>
            <p>
              <NuxtLink class="underline text-iceDeep" to="/docs/getting-started/linking">
                Here's how to link them →
              </NuxtLink>
            </p>
          </div>
        </Card>
      </div>
    </section>

    <!-- ── Session history ──────────────────────────────────── -->
    <section v-if="isLoggedIn">
      <SectionHeading title="Your play" eyebrow="the grind so far" />
      <div class="flex flex-col gap-4">
        <SessionStats />
        <SessionHistory />
      </div>
    </section>

    <!-- ── Leaderboard ──────────────────────────────────────── -->
    <section>
      <SectionHeading title="Top players" eyebrow="last 30 days" />
      <Leaderboard />
    </section>
  </div>
</template>

<script setup lang="ts">
import type PenguBotResponseInterface from '~/interfaces/PenguBotResponseInterface';
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';
import appConfig from '~/app.config';
import type ServerStatusInterface from "~/interfaces/ServerStatusInterface";

useHead({
  title: `The Penguin Network`,
  meta: [
    {
      name: 'description',
      content: 'Welcome to The Penguin Network - A friendly modded Minecraft community perfect for new and experienced players! Join our active servers including ATM10: To the Sky, All The Mods 10, GregTech: New Horizons, MC Eternal 2, Prominence 2, and Society: Sunlit Valley. Everyone is welcome!'
    },
  ],
})

const { loggedIn: isLoggedIn } = useUserSession()

const {data: servers} = await useFetch<ServerStatusInterface[]>('/api/all-alive-servers');

// Live server statuses, fetched once and shared by the hero + cards.
const { statuses, onlinePlayers, serversUp } = useServerStatuses(servers.value?.map((s) => s.shortName ?? '') ?? [])
const randomElement = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

const {data: publicUuids } = await useFetch<string[]>('/api/public-uuids');
const randomUuid =  ref<string>(randomElement(publicUuids.value ?? []) ?? '')

const {data: uuid} = await useFetch<string>('/api/user/uuid', {
  cache: false
});

const minecraftUuid = computed(() => {
  return isLoggedIn.value
    ? uuid
    : randomUuid
})

const { data, error, refresh } = await useFetch<PenguBotResponseInterface<PlayTimeResultInterface>|null>('/api/player-profile', {
  immediate: true,
  query: {  uuid: minecraftUuid.value },
})

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(
      () => {
        randomUuid.value = randomElement(publicUuids.value ?? []) ?? ''
        refresh()
      },
      appConfig.secondsToRefreshLookup * 1000
  )
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})

</script>
