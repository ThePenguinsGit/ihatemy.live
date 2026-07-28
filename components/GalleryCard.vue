<template>
  <article
    class="gcard flex flex-col gap-2.5 p-2.5"
    :class="{ 'cursor-pointer': clickable }"
    @click="$emit('open', entry)"
  >
    <!-- The painting frame -->
    <div
      v-if="entry.images.length"
      class="frame relative block w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
      :aria-label="`View ${entry.authorUsername}'s screenshot full size`"
    >
      <!-- The img must keep its layout box (opacity, not v-show/display:none):
           a display:none image never intersects the viewport, so loading="lazy"
           would never start the fetch and @load would never fire. -->
      <div class="relative aspect-[16/10] overflow-hidden">
        <img
          ref="shotImg"
          :src="entry.images[0]"
          :alt="entry.content || `Screenshot by ${entry.authorUsername}`"
          :title="postedAt"
          loading="lazy"
          class="w-full h-full object-cover"
          :class="{ 'opacity-0': !loaded }"
          @load="loaded = true"
          @error="loaded = true"
        />
        <Loading v-if="!loaded" class="absolute inset-0" />
      </div>
      <span
        v-if="entry.images.length > 1"
        class="more absolute right-1.5 bottom-1.5 font-[minecraft] text-xs px-1.5 py-0.5"
      >+{{ entry.images.length - 1 }}</span>
    </div>

    <div
      v-if="entry.contentHtml"
      ref="caption"
      class="discord-markup discord-markup--clamp text-sm text-white/80 leading-snug"
      :title="entry.content"
      v-html="entry.contentHtml"
    />
    <p v-else-if="entry.content" class="caption text-sm text-white/80 leading-snug m-0" :title="entry.content">
      {{ entry.content }}
    </p>

    <!-- The placard: museum plaque under the painting -->
    <div class="placard mt-auto flex items-center gap-2 px-2 py-1">
      <div class="avatar relative shrink-0 w-8 h-8 overflow-hidden">
        <img
          ref="avatarImg"
          :src="entry.authorAvatarUrl"
          alt=""
          loading="lazy"
          class="w-full h-full object-cover"
          :class="{ 'opacity-0': !avatarLoaded }"
          @load="avatarLoaded = true"
          @error="avatarLoaded = true"
        />
        <Loading v-if="!avatarLoaded" class="absolute inset-0" />
      </div>
      <span class="font-[minecraft] uppercase text-sm truncate mt-0.5" :title="entry.authorUsername">
        {{ entry.authorUsername }}
      </span>
      <span
        class="ml-auto shrink-0 font-[minecraft] text-sm whitespace-nowrap"
        :class="top ? 'votes-top px-1' : 'votes'"
        :title="`${entry.voteCount} ${entry.voteCount === 1 ? 'vote' : 'votes'}`"
      ><img src="/img/penguheart.png" alt="" class="vote-icon" /> {{ entry.voteCount.toLocaleString() }}</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import type GalleryEntryInterface from '~/interfaces/GalleryEntryInterface';

// One gallery entry, styled as a Minecraft painting in a beveled frame with a
// snow "placard" (museum plaque) underneath: author avatar + name + votes.
// Clicking the frame emits `open` so the parent grid can show its lightbox.
// `top` gives the vote count the solid-gold chip (page's highest-voted entry).
const props = defineProps<{
  entry: GalleryEntryInterface;
  top?: boolean;
  clickable?: boolean;
}>();

defineEmits<{ open: [entry: GalleryEntryInterface] }>();

const loaded = ref(false)
const avatarLoaded = ref(false)
const shotImg = ref<HTMLImageElement>()
const avatarImg = ref<HTMLImageElement>()
const caption = ref<HTMLElement>()
// No spoiler reveal on the card: the whole card opens the lightbox,
// which is where spoilers get revealed.
useDiscordMarkup(caption, { source: () => props.entry.contentHtml })

// Cached/fast images can finish before hydration attaches the @load
// listeners — pick their state up from `complete` on mount.
onMounted(() => {
  if (shotImg.value?.complete) loaded.value = true
  if (avatarImg.value?.complete) avatarLoaded.value = true
})

watch(() => props.entry.images[0], () => { loaded.value = false })
watch(() => props.entry.authorAvatarUrl, () => { avatarLoaded.value = false })

const postedAt = computed(() => `Posted ${useDayjs().unix(props.entry.createdAt).format('LL')}`)
</script>

<style scoped>
/* Dark beveled panel, same recipe as .panel-dark but with tighter padding. */
.gcard {
  background: var(--panel-surface-dark);
  border: 4px solid var(--panel-border);
  border-radius: 0;
  box-shadow:
    inset 3px 3px 0 var(--panel-highlight-dark),
    inset -3px -3px 0 var(--panel-shadow-dark),
    0 4px 0 var(--panel-drop);
  color: white;
  transition: transform 0.12s ease;
}
.gcard:hover { transform: translateY(-2px); }
@media (prefers-reduced-motion: reduce) {
  .gcard { transition: none; }
  .gcard:hover { transform: none; }
}

.frame {
  border: 3px solid var(--panel-border);
  border-radius: 0;
  box-shadow: inset 0 0 0 2px color-mix(in srgb, white 14%, transparent);
  padding: 0;
  background: none;
}

.more {
  background: var(--panel-surface);
  color: var(--color-ink);
  border: 2px solid var(--panel-border);
}

.caption {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

.vote-icon {
  display: inline-block;
  height: 1em;
  width: auto;
  vertical-align: -0.125em;
  image-rendering: pixelated;
}

.votes { color: var(--color-beakDark); }
.votes-top {
  background: var(--color-gold);
  color: var(--color-ink);
  border: 2px solid var(--panel-border);
}
</style>
