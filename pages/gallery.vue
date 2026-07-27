<template>
  <div class="flex mx-auto flex-col gap-4 grow max-w-7xl w-full">
    <div class="flex items-baseline justify-between mb-1">
      <h1 class="font-[minecraft] text-3xl md:text-4xl uppercase text-white drop-shadow">The Gallery</h1>
      <NuxtLink to="/" class="eyebrow !text-ice hover:underline">← Back to base</NuxtLink>
    </div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 -mt-2 mb-2">
      <p class="text-white/80">
        Screenshots and other "special" moments from our community on Discord. Post yours, sacrifice or get sacrificed.
      </p>
      <PixelButton :href="galleryChannelUrl" primary class="!py-1.5 shrink-0 self-start sm:self-auto">
        Open #gallery on Discord
      </PixelButton>
    </div>

    <GalleryGrid
      v-if="!data || data.data.length"
      :entries="data?.data ?? null"
      :highlight-top="page === 1"
      :podium="page === 1"
      :skeleton-count="9"
      :has-more-before="page > 1"
      :has-more-after="!!data && page < data.totalPages"
      @page="direction => page = Math.max(1, page + direction)"
    />

    <Card v-else variant="dark" class="flex flex-col items-start gap-3">
      <div>
        <h3 class="font-[minecraft] text-xl leading-none">Nothing on the walls yet</h3>
        <p class="text-white/80 leading-snug mt-1">
          Post a screenshot in the Discord and get voted in.
        </p>
      </div>
      <PixelButton href="/discord" primary class="!py-1.5">Join the Discord</PixelButton>
    </Card>

    <div v-if="data && data.totalPages > 1" class="flex items-center justify-center gap-3 mt-2">
      <PixelButton class="!py-1.5" :disabled="page <= 1" @click="page--">← Prev</PixelButton>
      <span class="font-[minecraft] uppercase text-sm text-white whitespace-nowrap">Page {{ data.page }} / {{ data.totalPages }}</span>
      <PixelButton class="!py-1.5" primary :disabled="page >= data.totalPages" @click="page++">Next →</PixelButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import type PaginatedResponseInterface from '~/interfaces/PaginatedResponseInterface';
import type GalleryEntryInterface from '~/interfaces/GalleryEntryInterface';

const PER_PAGE = 24

useSeoMeta({
  title: 'The Gallery',
  description: 'Special moments from The Penguin Network - posted and ranked by our community!',
})

defineOgImage('PenguinCard', {
  eyebrow: 'The PenguinNetwork',
  title: 'The Gallery',
  description: 'Moments the Community posted and voted up.',
})

const route = useRoute()
const router = useRouter()

// Direct link to the #gallery Discord channel; invite link until it's configured.
const { public: { discordGalleryChannelUrl, discordUrl } } = useRuntimeConfig()
const galleryChannelUrl = discordGalleryChannelUrl || discordUrl

// Page number lives in ?page= so gallery pages are shareable and SSR-rendered.
const parsePage = (value: unknown) => {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : 1
}
const page = ref(parsePage(route.query.page))

watch(page, (p) => {
  const target = p === 1 ? undefined : String(p)
  if ((route.query.page ?? undefined) !== target) {
    router.push({ query: { ...route.query, page: target } })
  }
})

// Back/forward navigation: the route drives the page ref.
watch(() => route.query.page, (q) => {
  const parsed = parsePage(q)
  if (parsed !== page.value) page.value = parsed
})

const { data } = await useFetch<PaginatedResponseInterface<GalleryEntryInterface>>('/api/gallery', {
  query: { page, perPage: PER_PAGE },
})
</script>
