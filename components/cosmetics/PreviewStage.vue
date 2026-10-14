<template>
  <div class="chat-box flex flex-col gap-0.5 text-sm md:text-base" aria-live="polite">
    <p :key="`join-${join?.id ?? 'vanilla'}-${replay ?? 0}`" :class="lineClass('JOIN_MESSAGE')">
      <span v-if="join?.contentHtml" v-html="join.contentHtml" />
      <span v-else-if="join">{{ stripMiniMessage(join.content) }}</span>
      <span v-else-if="defaultLine === 0" class="text-[var(--mc-yellow)]"><PlayerName /> joined {{ server }}!</span>
      <span v-else class="text-[var(--mc-yellow)]"><PlayerName /> has descended upon {{ server }}! <span class="text-[var(--mc-red)]">RUN</span></span>
    </p>

    <!-- Join sounds play as you join, so they sit right under the join line -->
    <p
      v-if="sound || highlight === 'SOUND'"
      :key="`sound-${sound?.id ?? 'none'}-${replay ?? 0}`"
      class="flex items-center gap-2 text-[var(--mc-gray)]"
      :class="lineClass('SOUND')"
    >
      <PixelIcon name="sound" class="shrink-0" />
      <span v-if="sound" :title="sound.content">
        Plays
        <span v-if="sound.nameHtml" v-html="sound.nameHtml" />
        <span v-else class="text-white">{{ stripMiniMessage(sound.name) }}</span>
        when you join
      </span>
      <span v-else>No sound when you join, it's quiet in here</span>
      <CosmeticsSoundButton :item="sound" compact />
    </p>

    <p :key="`badge-${badge?.id ?? 'none'}`" :class="lineClass('BADGE')">
      <template v-if="badge">
        <span v-if="badge.contentHtml" v-html="badge.contentHtml" />
        <span v-else>{{ stripMiniMessage(badge.content) }}</span>
        {{ ' ' }}
      </template>
      <PlayerName />: {{ message }}
    </p>

    <p :key="`leave-${leave?.id ?? 'vanilla'}`" :class="lineClass('LEAVE_MESSAGE')">
      <span v-if="leave?.contentHtml" v-html="leave.contentHtml" />
      <span v-else-if="leave">{{ stripMiniMessage(leave.content) }}</span>
      <span v-else-if="defaultLine === 0" class="text-[var(--mc-yellow)]"><PlayerName /> left!</span>
      <span v-else class="text-[var(--mc-yellow)]"><PlayerName /> has abandoned us!</span>
    </p>
  </div>
</template>

<script setup lang="ts">
import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import type { CosmeticType } from '~/interfaces/CosmeticItemInterface';
import { stripMiniMessage } from '~/utils/plainText';
import { nickSegmentStyle } from '~/utils/nickRender';
import Loading from '~/components/Loading.vue';
import { servers } from '~/data/servers';

// A fake chat log showing cosmetics the way they look in game. `contentHtml`
// already has the player's name in place of <pengu_displayname>, so only the
// default join/leave lines and the chat line need the name: the player's nick
// when they have one, else `playerName`.
const props = defineProps<{
  badge?: CosmeticItemInterface,
  join?: CosmeticItemInterface,
  leave?: CosmeticItemInterface,
  sound?: CosmeticItemInterface,
  // The line the current pick changes; it re-types when the pick changes.
  highlight?: CosmeticType | null,
  // Bump to replay joining: the join and sound lines type out again.
  replay?: number,
  playerName: string,
}>();

const messages = [
    'I\'m back bby',
    'What\'s up greggers',
    'How do you do fellow Minecraft® enjoyers',
    'Hello. Yes. I. am. here. :()',
    'o7',
    'Oh I just had one',
    'Sure hope I don\'t get kicked',
    'Can\'t wait for the next server restart',
    'I\'m a restart enjoyer',
];

// Any message but the one showing, so a change is always visible.
const randomMessage = (current: string) => {
  const others = messages.filter(m => m !== current);
  return others[Math.floor(Math.random() * others.length)] ?? current;
};

// Without a join/leave cosmetic the network has two default lines each; they
// take turns, and the join lines name a random server by its shortname.
const shortNames = servers.map(s => s.hostname.split('.')[0]!.toUpperCase());
const randomServer = (current: string) => {
  const others = shortNames.filter(n => n !== current);
  return others[Math.floor(Math.random() * others.length)] ?? current;
};

// The server and the browser both render the first message, line and server,
// so hydration matches; the random picks happen once mounted.
const message = ref<string>(messages[0]!);
const defaultLine = ref(0);
const server = ref<string>(shortNames[0]!);

let interval: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  message.value = randomMessage(message.value);
  server.value = randomServer(server.value);
  interval = setInterval(() => {
    message.value = randomMessage(message.value);
    defaultLine.value = 1 - defaultLine.value;
    server.value = randomServer(server.value);
  }, 10000);
});

onBeforeUnmount(() => clearInterval(interval));

const lineClass = (type: CosmeticType) =>
  props.highlight === type || (props.replay && (type === 'JOIN_MESSAGE' || type === 'SOUND')) ? 'retype' : undefined;

const { segments, settled } = usePlayerNick();

// The name as it shows in game: the nick with its own colors and formatting,
// else the plain name in the line's color (yellow on the default join/leave
// lines). A placeholder until the nick has loaded, so it doesn't flicker.
// Obfuscated parts get the `obfuscated` class NickSetting already scrambles.
const PlayerName = () => {
  if (!settled.value) return h(Loading, { width: `${Math.max(3, props.playerName.length)}ch`, class: 'align-middle' });
  if (!segments.value.length) return h('span', props.playerName);
  return h('span', segments.value.map(seg =>
    h('span', { style: nickSegmentStyle(seg), class: seg.style.obfuscated ? 'obfuscated' : undefined }, seg.text),
  ));
};
</script>

<style scoped>
/* Lines are keyed on the item they show, so a new pick remounts the line and
   replays this: typed out left to right in hard steps. */
.retype {
  animation: retype 0.45s steps(18, end);
}
@keyframes retype {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@media (prefers-reduced-motion: reduce) {
  .retype { animation: none; }
}
</style>
