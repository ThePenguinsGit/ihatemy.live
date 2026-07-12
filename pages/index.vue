<template>
  <div class="flex flex-col gap-8 max-w-7xl mx-auto w-full">
    <HeroSection
        v-if="servers"
      :online-players="onlinePlayers"
      :servers-up="serversUp"
      :total-servers="servers?.length"
    />

    <section>
      <SectionHeading title="Servers" eyebrow="The graveyard →" to="/graveyard" />
      <div class="flex flex-wrap justify-center gap-4">
        <ServerCard
          v-for="server in servers"
          :key="server.shortName"
          :server="server"
          :stats="statuses[server.shortName]"
          class="w-full md:w-[calc((100%-1rem)/2)] xl:w-[calc((100%-2rem)/3)]"
        />
      </div>
    </section>

    <!-- ── Logged-out pitch: what an account gets you ──────────── -->
    <section v-if="!isLoggedIn">
      <SectionHeading title="Make it yours">
        <template #eyebrow>
          <span class="eyebrow !text-ice" title="some sacrifice might be required">no sacrifice required<sup>*</sup></span>
        </template>
      </SectionHeading>
      <Card variant="dark" class="flex flex-col gap-5">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-2xl">
            <h3 class="font-[minecraft] text-xl md:text-2xl leading-none">This could be your account</h3>
            <p class="text-white/80 leading-snug mt-1">
              Log in and find out what we know.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <PixelButton to="/login" primary class="!py-1.5">Log in</PixelButton>
            <PixelButton to="/docs/getting-started/linking" class="!py-1.5">How linking works</PixelButton>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div v-for="perk in loginPerks" :key="perk.title" class="flex items-start gap-3">
            <PixelIcon :name="perk.icon" class="text-ice text-3xl shrink-0" />
            <div>
              <h4 class="font-[minecraft] uppercase text-sm">{{ perk.title }}</h4>
              <p class="text-sm text-white/80 leading-snug">{{ perk.body }}</p>
            </div>
          </div>
        </div>
      </Card>
    </section>

    <!-- ── Logged in, but no Minecraft account linked yet ───────── -->
    <section v-if="isLoggedIn && !isLinked">
      <SectionHeading title="Just one more step">
        <template #eyebrow>
          <span class="eyebrow !text-ice" title="some sacrifice might be required">the servers can't see you <span class="obf">yet</span></span>
        </template>
      </SectionHeading>
      <Card variant="dark" class="flex flex-col gap-4">
        <div class="max-w-2xl">
          <h3 class="font-[minecraft] text-xl md:text-2xl leading-none">Which cultist are you?</h3>
          <p class="text-white/80 leading-snug mt-1">
            You're logged in, but we can't connect your chat crimes to your war crimes yet.<br>
            Login with Xbox so we'll know and can show you the goods.
          </p>
        </div>
        <LoginXboxButton sublabel="Links your Minecraft account automatically" />
        <p class="text-sm text-white/60">
          Prefer linking in-game?
          <NuxtLink class="underline text-ice" to="/docs/getting-started/linking">Here's how →</NuxtLink>
        </p>
      </Card>
    </section>

    <!-- ── Account based data (logged in + linked only) ─────────── -->
    <section v-if="isLinked">
      <SectionHeading title="Your account">
        <template #eyebrow>
          <SubscriptionTier />
        </template>
      </SectionHeading>

      <div class="grid grid-cols-1 gap-4 items-stretch">
        <PlayerProfileCard
          v-if="data"
          :data="data"
        />
        <Card v-else variant="panel" class="flex items-center justify-center">
          <Loading width="100%" height="8rem" />
        </Card>
        <NickSetting :uuid="minecraftUuid" :default-username="data?.data.userName ?? ''" />
        <TokenHistory />
      </div>
    </section>

    <!-- ── Session based data ──────────────────────────────────── -->
    <section v-if="isLinked">
      <SectionHeading title="Your play" eyebrow="one sacrifice at a time" />
      <div class="flex flex-col gap-4">
        <SessionStats />
        <Achievements />
        <SessionHistory />
      </div>
    </section>

    <!-- ── Leaderboard ──────────────────────────────────────── -->
    <section>
      <SectionHeading title="Top players" eyebrow="last 30 days" />
      <Leaderboard :hide-link="true" />
    </section>
  </div>
</template>

<script setup lang="ts">
import type PenguBotResponseInterface from '~/interfaces/PenguBotResponseInterface';
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';
import appConfig from '~/app.config';

const description = 'Welcome to The Penguin Network - A friendly modded Minecraft community perfect for new and experienced players! Join our active servers including ATM10: To the Sky, All The Mods 10, GregTech: New Horizons, MC Eternal 2, Prominence 2, and Society: Sunlit Valley. Everyone is welcome!'

useSeoMeta({
  title: 'The Penguin Network',
  description,
  ogTitle: 'The Penguin Network — Modded Minecraft Servers',
  ogDescription: description,
})

defineOgImage('PenguinCard', {
  eyebrow: 'Modded Minecraft network',
  title: 'The Penguin Network',
  description: 'Free, public servers for ATM10, GregTech: New Horizons, MC Eternal 2, and more. Join quickly for free PenguTokens',
})

// Structured data so search engines and AI assistants can identify the site
// and the community behind it.
useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://ihatemy.live/#organization',
            name: 'The Penguin Network',
            url: 'https://ihatemy.live',
            logo: 'https://ihatemy.live/logo_big.png',
            description: 'A friendly modded Minecraft community running multiple public servers.',
            sameAs: ['https://discord.gg/tM4urb5SPQ'],
          },
          {
            '@type': 'WebSite',
            '@id': 'https://ihatemy.live/#website',
            name: 'The Penguin Network',
            url: 'https://ihatemy.live',
            publisher: { '@id': 'https://ihatemy.live/#organization' },
            about: {
              '@type': 'VideoGame',
              name: 'Minecraft',
            },
          },
        ],
      }),
    },
  ],
})

const { loggedIn: isLoggedIn, user } = useUserSession()

const { aliveServers: servers } = storeToRefs(useServerStore());

// Live server statuses, fetched once and shared by the hero + cards.
const { statuses, onlinePlayers, serversUp } = useServerStatuses()

// What a login unlocks — shown to logged-out visitors instead of the account section.
const loginPerks = [
  {
    icon: 'nametag',
    title: 'Your nick, your colors, you know, the colors',
    body: 'Design a nickname with colors and gradients in the live editor and save it straight to the servers.',
  },
  {
    icon: 'chart',
    title: 'Levels & playtime',
    body: 'See your level, total playtime, and token balance. Mostly up to date™.',
  },
  {
    icon: 'advancement',
    title: 'Sessions & achievements',
    body: 'Look back on every session and collect achievements for your finest sacrifices.',
  },
  {
    icon: 'chain',
    title: 'Link accounts right here',
    body: 'Connect Discord and Minecraft on this site. Log in with both to get linked, easy as going into the Player-Explosion-Chamber®.',
  },
]

const minecraftUuid = computed(() => user.value?.minecraftUuid ?? '')
const isLinked = computed(() => isLoggedIn.value && !!minecraftUuid.value)

// Only fetched for users with a linked Minecraft account; the manual watch
// below (not the query) drives fetching, so logged-out visitors never hit it.
const { data, refresh } = await useFetch<PenguBotResponseInterface<PlayTimeResultInterface>|null>('/api/player-profile', {
  query: { uuid: minecraftUuid },
  immediate: false,
  watch: false,
})

watch(minecraftUuid, (uuid) => {
  if (uuid) refresh()
  else data.value = null
}, { immediate: true })

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(
      () => {
        if (minecraftUuid.value) refresh()
      },
      appConfig.secondsToRefreshLookup * 1000
  )
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})

</script>
