<template>
  <div>
    <!-- Loading skeletons: frame + placard silhouette, no layout shift -->
    <div v-if="!entries" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div v-for="i in skeletonCount" :key="i" class="skeleton flex flex-col gap-2.5 p-2.5">
        <Loading class="aspect-[16/10] w-full" />
        <Loading width="100%" height="1.9em" />
      </div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <!-- Podium: 2nd – 1st – 3rd on md+, stacked 1-2-3 on mobile -->
      <div v-if="podiumSlots" class="grid grid-cols-1 md:grid-cols-3 gap-4 md:items-end">
        <div
          v-for="slot in podiumSlots"
          :key="slot.entry.messageId"
          class="flex flex-col"
          :class="slot.placement"
        >
          <GalleryCard :entry="slot.entry" :top="slot.rank === 1" clickable @open="open" />
          <div
            class="pedestal mt-1 flex items-center justify-center"
            :class="[slot.height, `pedestal--${slot.material}`]"
          >
            <span class="flex items-baseline gap-2">
              <span
                class="font-[minecraft] leading-none"
                :class="slot.rank === 1 ? 'text-3xl' : 'text-2xl'"
              >#{{ slot.rank }}</span>
            </span>
          </div>
        </div>
      </div>

      <div v-if="restEntries.length" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <GalleryCard
          v-for="(entry, i) in restEntries"
          :key="entry.messageId"
          :entry="entry"
          :top="!podiumSlots && highlightTop && i === 0"
          clickable
          @open="open"
        />
      </div>
    </div>

    <!-- Lightbox: full-size image + placard, arrows through the entry's images -->
    <Teleport to="body">
      <div
        v-if="viewing"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85"
        role="dialog"
        aria-modal="true"
        :aria-label="`Screenshot by ${viewing.authorUsername}`"
        @click.self="close"
      >
        <PixelButton class="!absolute top-3 right-3 !px-3 !py-1.5" aria-label="Close" @click="close">✕</PixelButton>

        <PixelButton
          v-if="canPrev"
          class="!absolute left-3 top-1/2 -translate-y-1/2 !px-3 !py-1.5"
          aria-label="Previous"
          @click="step(-1)"
        >←</PixelButton>
        <PixelButton
          v-if="canNext"
          class="!absolute right-3 top-1/2 -translate-y-1/2 !px-3 !py-1.5"
          aria-label="Next"
          @click="step(1)"
        >→</PixelButton>

        <figure class="flex flex-col gap-2 m-0 max-w-7xl w-full min-h-0">
          <img
            ref="lightboxImage"
            :src="viewing.images[imageIndex]"
            :alt="viewing.content || `Screenshot by ${viewing.authorUsername}`"
            class="lightbox-img mx-auto max-w-full max-h-[80vh] object-contain"
            tabindex="-1"
          />
          <figcaption class="flex flex-col gap-1 max-w-2xl w-full mx-auto">
            <p v-if="viewing.content" class="caption-box text-white/90 text-sm leading-snug m-0 px-3 py-1.5">{{ viewing.content }}</p>
            <div class="placard flex items-center gap-2 px-2 py-1">
              <img :src="viewing.authorAvatarUrl" alt="" class="avatar w-10 h-10 object-cover shrink-0" />
              <span class="font-[minecraft] uppercase text-xl truncate">{{ viewing.authorUsername }}</span>
              <span class="ml-auto shrink-0 font-[minecraft] text-xs text-beakDark whitespace-nowrap">★ {{ viewing.voteCount.toLocaleString() }}</span>
            </div>
            <div class="flex justify-between font-[minecraft] uppercase text-xs text-white/60">
              <span v-if="viewing.images.length > 1">Image {{ imageIndex + 1 }} / {{ viewing.images.length }}</span>
              <span v-else>&nbsp;</span>
              <span>Posted {{ formatDate(viewing.createdAt) }}</span>
            </div>
          </figcaption>
        </figure>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type GalleryEntryInterface from '~/interfaces/GalleryEntryInterface';

// Presentational grid of gallery entries with a built-in lightbox, shared by
// the landing-page section and /gallery. `entries: null` renders skeletons.
// `highlightTop` gives the first entry the gold vote chip — only set it when
// rendering page 1, where entries[0] really is the top-voted entry overall.
// `podium` puts the first three entries on gold/silver/bronze pedestals
// (2nd–1st–3rd on desktop) — same caveat: page 1 only.
// The lightbox arrows walk a continuous stream: images within an entry, then
// the next/previous entry, then — when `hasMoreAfter`/`hasMoreBefore` say a
// neighbouring page exists — a `page` event asks the parent to load it. Once
// the new `entries` arrive, the lightbox continues at the near end of that
// page while the grid behind it updates too.
const props = withDefaults(defineProps<{
  entries: GalleryEntryInterface[] | null;
  highlightTop?: boolean;
  podium?: boolean;
  skeletonCount?: number;
  hasMoreBefore?: boolean;
  hasMoreAfter?: boolean;
}>(), { skeletonCount: 6 });

const emit = defineEmits<{ page: [direction: 1 | -1] }>()

// DOM order is 1, 2, 3 (= mobile stacking order); on md+ explicit column
// starts rearrange the same row into silver – gold – bronze.
const podiumSlots = computed(() => {
  if (!props.podium || !props.entries || props.entries.length < 3) return null
  const [first, second, third] = props.entries
  return [
    { entry: first!, rank: 1, material: 'diamond', placement: 'md:col-start-2 md:row-start-1', height: 'h-16' },
    { entry: second!, rank: 2, material: 'gold', placement: 'md:col-start-1 md:row-start-1', height: 'h-12' },
    { entry: third!, rank: 3, material: 'iron', placement: 'md:col-start-3 md:row-start-1', height: 'h-9' },
  ]
})

const restEntries = computed(() =>
  podiumSlots.value ? props.entries!.slice(3) : props.entries ?? []
)

const viewing = ref<GalleryEntryInterface | null>(null)
const imageIndex = ref(0)
const lightboxImage = ref<HTMLImageElement>()

const open = (entry: GalleryEntryInterface) => {
  viewing.value = entry
  imageIndex.value = 0
  nextTick(() => lightboxImage.value?.focus())
}
const close = () => { viewing.value = null }

// Direction of a page load requested from inside the lightbox; arrows are
// inert until the new entries arrive (see the watcher below).
const pendingPage = ref<0 | 1 | -1>(0)

const viewingIndex = computed(() =>
  props.entries?.findIndex(e => e.messageId === viewing.value?.messageId) ?? -1
)

// The arrows are hidden entirely when nothing lies in their direction. A
// pending page load deliberately doesn't hide them (step() ignores clicks
// while pending) — that would only flash the buttons out and back in.
const canPrev = computed(() => {
  if (!viewing.value) return false
  return imageIndex.value > 0 || viewingIndex.value > 0 || !!props.hasMoreBefore
})
const canNext = computed(() => {
  if (!viewing.value) return false
  return imageIndex.value < viewing.value.images.length - 1
    || (props.entries !== null && viewingIndex.value < props.entries.length - 1)
    || !!props.hasMoreAfter
})

const step = (delta: 1 | -1) => {
  if (!viewing.value || !props.entries || pendingPage.value) return
  if (delta === 1) {
    if (imageIndex.value < viewing.value.images.length - 1) {
      imageIndex.value++
    } else if (viewingIndex.value < props.entries.length - 1) {
      viewing.value = props.entries[viewingIndex.value + 1]!
      imageIndex.value = 0
    } else if (props.hasMoreAfter) {
      pendingPage.value = 1
      emit('page', 1)
    }
  } else {
    if (imageIndex.value > 0) {
      imageIndex.value--
    } else if (viewingIndex.value > 0) {
      viewing.value = props.entries[viewingIndex.value - 1]!
      imageIndex.value = Math.max(0, viewing.value.images.length - 1)
    } else if (props.hasMoreBefore) {
      pendingPage.value = -1
      emit('page', -1)
    }
  }
}

// When the parent delivers the requested page, resume at its near end: first
// entry when paging forward, last entry (last image) when paging back.
watch(() => props.entries, (entries) => {
  if (!pendingPage.value || !entries?.length) return
  if (viewing.value) {
    if (pendingPage.value === 1) {
      viewing.value = entries[0]!
      imageIndex.value = 0
    } else {
      viewing.value = entries[entries.length - 1]!
      imageIndex.value = Math.max(0, viewing.value.images.length - 1)
    }
  }
  pendingPage.value = 0
})

const onKeydown = (e: KeyboardEvent) => {
  if (!viewing.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') step(-1)
  else if (e.key === 'ArrowRight') step(1)
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const formatDate = (unix: number) => useDayjs().unix(unix).format('LL')
</script>

<style scoped>
.skeleton {
  background: var(--panel-surface-dark);
  border: 4px solid var(--panel-border);
  box-shadow: 0 4px 0 var(--panel-drop);
}

/* Podium pedestals — mineral blocks in Minecraft's tier order (diamond >
   gold > iron), beveled like every panel. The card's 4px drop shadow lands
   on the pedestal's top edge (mt-1), joining the two. */
.pedestal {
  border: 4px solid var(--panel-border);
  color: var(--color-ink);
  box-shadow:
    inset 3px 3px 0 var(--panel-highlight),
    inset -3px -3px 0 var(--panel-shadow-dark),
    0 4px 0 var(--panel-drop);
}

.pedestal--diamond { background: var(--color-ice); }
.pedestal--gold { background: var(--color-gold); }
.pedestal--iron { background: color-mix(in srgb, white 78%, var(--color-ink)); }

.lightbox-img {
  border: 3px solid var(--panel-border);
  box-shadow: inset 0 0 0 2px color-mix(in srgb, white 14%, transparent);
}

/* Dark boxed caption above the placard — full text, no clamping. */
.caption-box {
  background: var(--panel-surface-dark);
  border: 2px solid var(--panel-border);
  box-shadow: inset 0 -2px 0 var(--panel-shadow-dark);
}

.placard {
  background: var(--panel-surface);
  color: var(--color-ink);
  border: 2px solid var(--panel-border);
  box-shadow: inset 0 -2px 0 var(--panel-shadow);
}

.avatar {
  border: 2px solid var(--panel-border);
  image-rendering: pixelated;
}
</style>
