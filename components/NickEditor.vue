<template>
  <div class="flex flex-col gap-2">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-1">
      <button type="button" class="tb" :class="{ on: active.bold }" title="Bold"
        @mousedown.prevent @click="onDecoration('bold')">
        <span :class="lockClass('format')"><b>B</b></span>
      </button>
      <button type="button" class="tb" :class="{ on: active.italic }" title="Italic"
        @mousedown.prevent @click="onDecoration('italic')">
        <span :class="lockClass('format')"><i>I</i></span>
      </button>
      <button type="button" class="tb" :class="{ on: active.underlined }" title="Underline"
        @mousedown.prevent @click="onDecoration('underlined')">
        <span :class="lockClass('format')"><u>U</u></span>
      </button>
      <button type="button" class="tb" :class="{ on: active.strikethrough }" title="Strikethrough"
        @mousedown.prevent @click="onDecoration('strikethrough')">
        <span :class="lockClass('format')"><s>S</s></span>
      </button>
      <button type="button" class="tb" :class="{ on: active.obfuscated }" title="Obfuscated"
        @mousedown.prevent @click="onDecoration('obfuscated')">
        <span :class="lockClass('format')">▓</span>
      </button>

      <span class="w-px h-6 bg-ink/20 mx-1" />

      <!-- Color swatches -->
      <button
        v-for="c in swatches" :key="c.name" type="button"
        class="tb !p-0 w-6 h-6 border-2 border-ink" :style="{ background: c.hex }"
        :title="`Color: ${c.name}`"
        @mousedown.prevent @click="onColor(c.name)"
      />
      <label class="tb cursor-pointer" title="Custom color" @mousedown.prevent>
        <span :class="lockClass('color')">🎨</span>
        <input type="color" class="sr-only" @input="onColor(($event.target as HTMLInputElement).value)">
      </label>

      <span class="w-px h-6 bg-ink/20 mx-1" />

      <!-- Gradient -->
      <span class="inline-flex items-center gap-1 tb" title="Gradient">
        <input type="color" v-model="gradA" class="w-5 h-5 border border-ink p-0" @mousedown.stop>
        <input type="color" v-model="gradB" class="w-5 h-5 border border-ink p-0" @mousedown.stop>
        <button type="button" @mousedown.prevent @click="onGradient">
          <span :class="lockClass('gradient')">▤</span>
        </button>
      </span>
      <button type="button" class="tb" title="Rainbow"
        @mousedown.prevent @click="onRainbow">
        <span :class="lockClass('gradient')">🌈</span>
      </button>

      <span class="w-px h-6 bg-ink/20 mx-1" />
      <button type="button" class="tb" title="Clear formatting"
        @mousedown.prevent @click="onClear">✕</button>
      <button type="button" class="tb" title="Reset to your username"
        @mousedown.prevent @click="onReset">↺</button>
    </div>

    <div class="bg-nick1 flex flex-row bg-bottom text-2xl min-h-[2.5rem]">
        <div
            class="text-wrap overflow-hidden break-all shrink text-white hidden sm:flex flex-col justify-center font-[minecraft] px-2  "
            v-html="prefix"
        />
        <!-- Editable WYSIWYG surface -->
        <div
          ref="editable"
          contenteditable="true"
          class="nick-surface px-2 py-1 border-2 border-ink  text-white break-all outline-none grow"
          :data-placeholder="placeholder"
          spellcheck="false"
          @input="syncFromDom"
          @focus="restoreReal"
          @blur="onBlur"
          @keydown="onKeydown"
          @paste="onPaste"
        />
    </div>

    <!-- Locked-feature upsell -->
    <Card v-if="upsell" variant="dark" class="p-3 text-sm flex flex-col gap-2">
      <div>
        <b class="text-ice">{{ upsell.label }}</b> is a
        <b>{{ upsell.tier }}</b> perk. Support the network to unlock it.
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <PixelButton href="https://ko-fi.com/penguinnetwork" primary class="!py-1 text-xs">Donate on Ko-fi</PixelButton>
        <PixelButton to="/docs/donations" class="!py-1 text-xs">See all tiers</PixelButton>
        <button type="button" class="ml-auto text-white/60 hover:text-white" @click="upsell = null">dismiss</button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { NickRun, NickPaint } from '~/interfaces/NickRun';
import { unlocks, minTierFor, type DonationTier, type NickFeature } from '~/data/donationTiers';
import { MC_HEX, nickSegments, nickStyleKey, toNickChars } from '~/utils/nickRender';

const props = defineProps<{
  modelValue: string;
  defaultUsername: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const { user } = useUserSession()
const donationTier = computed(() => (user.value?.donatorGroup ?? null) as DonationTier | null)

const { data:prefix } = await useFetch<string>('/api/mini-message/prefix', {
  cache: false,
});

const placeholder = 'Type your nick…';

// Only decorations live as booleans; paint is a separate object.
type DecoKey = 'bold' | 'italic' | 'underlined' | 'strikethrough' | 'obfuscated';
type Style = Omit<NickRun, 'text'>;
interface Char { ch: string; style: Style }

const editable = ref<HTMLDivElement | null>(null);
const upsell = ref<{ label: string; tier: string } | null>(null);
const active = ref<Record<DecoKey, boolean> & { paint: NickPaint | undefined }>({
  bold: false, italic: false, underlined: false, strikethrough: false,
  obfuscated: false, paint: undefined,
});

const gradA = ref('#ff0000');
const gradB = ref('#0000ff');

const swatches = Object.entries(MC_HEX)
  .filter(([n]) => !['grey', 'dark_grey'].includes(n))
  .map(([name, hex]) => ({ name, hex }));

const featureLabels: Record<NickFeature, string> = {
  color: 'Nickname colors', format: 'Nickname formatting', gradient: 'Nickname gradients',
};



const lockClass = (f: NickFeature) => (unlocks(donationTier.value, f) ? '' : 'opacity-40');

const gate = (feature: NickFeature): boolean => {
  if (unlocks(donationTier.value, feature)) return true;
  upsell.value = { label: featureLabels[feature], tier: minTierFor(feature).name };
  return false;
};

// ── model <-> chars ────────────────────────────────────────────────────────
const styleKey = nickStyleKey;
const toChars = toNickChars;
const fromChars = (chars: Char[]): NickRun[] => {
  const runs: NickRun[] = [];
  let lastKey = '';
  for (const c of chars) {
    const key = styleKey(c.style);
    const last = runs[runs.length - 1];
    if (last && key === lastKey) last.text += c.ch;
    else { runs.push({ ...c.style, text: c.ch }); lastKey = key; }
  }
  return runs;
};

// ── DOM rendering + readback ───────────────────────────────────────────────
const makeSpan = (text: string, style: Style, color: string | undefined): HTMLSpanElement => {
  const span = document.createElement('span');
  span.textContent = text;
  if (style.bold) { span.style.fontWeight = 'bold'; span.dataset.bold = '1'; }
  if (style.italic) { span.style.fontStyle = 'italic'; span.dataset.italic = '1'; }
  const deco: string[] = [];
  if (style.underlined) { deco.push('underline'); span.dataset.underlined = '1'; }
  if (style.strikethrough) { deco.push('line-through'); span.dataset.strikethrough = '1'; }
  if (deco.length) span.style.textDecoration = deco.join(' ');
  if (style.obfuscated) { span.classList.add('nick-obf'); span.dataset.obfuscated = '1'; span.dataset.real = text; }
  if (style.paint) span.dataset.paint = JSON.stringify(style.paint);
  if (color) span.style.color = color;
  return span;
};

const renderRuns = (runs: NickRun[]) => {
  const el = editable.value;
  if (!el) return;
  // Segments carry each span's *full* text, so makeSpan's data-real (used by
  // the scrambler) holds the whole run rather than its first character.
  const segs = nickSegments(runs);
  el.replaceChildren(...segs.map((s) => makeSpan(s.text, s.style, s.color)));
};

const readDom = (): NickRun[] => {
  const el = editable.value;
  if (!el) return [];
  const runs: NickRun[] = [];
  for (const node of Array.from(el.childNodes)) {
    const text = node.textContent ?? '';
    if (!text) continue;
    if (node.nodeType === Node.TEXT_NODE) { runs.push({ text }); continue; }
    const d = (node as HTMLElement).dataset;
    runs.push({
      text,
      bold: d.bold ? true : undefined,
      italic: d.italic ? true : undefined,
      underlined: d.underlined ? true : undefined,
      strikethrough: d.strikethrough ? true : undefined,
      obfuscated: d.obfuscated ? true : undefined,
      paint: d.paint ? (JSON.parse(d.paint) as NickPaint) : undefined,
    });
  }
  return runs;
};

// ── selection offsets (code units) ─────────────────────────────────────────
const offsets = (): { start: number; end: number } => {
  const el = editable.value;
  const sel = window.getSelection();
  if (!el || !sel || sel.rangeCount === 0) return { start: 0, end: 0 };
  const r = sel.getRangeAt(0);
  if (!el.contains(r.commonAncestorContainer) && r.commonAncestorContainer !== el) {
    return { start: 0, end: 0 };
  }
  const len = (node: Node, off: number) => {
    const range = document.createRange();
    range.setStart(el, 0);
    range.setEnd(node, off);
    return range.toString().length;
  };
  const start = len(r.startContainer, r.startOffset);
  const end = len(r.endContainer, r.endOffset);
  return start <= end ? { start, end } : { start: end, end: start };
};

const setSelection = (start: number, end: number) => {
  const el = editable.value;
  if (!el) return;
  const locate = (offset: number): { node: Node; offset: number } => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let total = 0;
    let last: Text | null = null;
    let t: Node | null;
    while ((t = walker.nextNode())) {
      const text = t as Text;
      if (offset <= total + text.data.length) return { node: text, offset: offset - total };
      total += text.data.length;
      last = text;
    }
    if (last) return { node: last, offset: last.data.length };
    return { node: el, offset: 0 };
  };
  const range = document.createRange();
  const a = locate(start);
  const b = locate(end);
  range.setStart(a.node, a.offset);
  range.setEnd(b.node, b.offset);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};

// ── mutation core ──────────────────────────────────────────────────────────
const emitModel = (runs: NickRun[]) => {
  lastEmitted = serializeRuns(runs);
  emit('update:modelValue', lastEmitted);
};

const mutate = (fn: (chars: Char[], start: number, end: number) => void) => {
  const el = editable.value;
  if (!el) return;
  el.focus();
  let { start, end } = offsets();
  const chars = toChars(readDom());
  if (start === end) { start = 0; end = chars.length; } // no selection → whole nick
  if (chars.length === 0) return;
  fn(chars, start, end);
  const runs = fromChars(chars);
  renderRuns(runs);
  setSelection(start, end);
  emitModel(runs);
  updateActive();
};

const onDecoration = (key: DecoKey) => {
  if (!gate('format')) return;
  mutate((chars, start, end) => {
    const seg = chars.slice(start, end);
    const allOn = seg.length > 0 && seg.every((c) => c.style[key]);
    for (let i = start; i < end; i++) {
      chars[i] = { ch: chars[i].ch, style: { ...chars[i].style, [key]: allOn ? undefined : true } };
    }
  });
};

const applyPaint = (paint: NickPaint | undefined) => {
  mutate((chars, start, end) => {
    for (let i = start; i < end; i++) {
      chars[i] = { ch: chars[i].ch, style: { ...chars[i].style, paint } };
    }
  });
};
const onColor = (value: string) => { if (gate('color')) applyPaint({ type: 'color', value }); };
const onGradient = () => { if (gate('gradient')) applyPaint({ type: 'gradient', colors: [gradA.value, gradB.value] }); };
const onRainbow = () => { if (gate('gradient')) applyPaint({ type: 'rainbow' }); };
const onClear = () => {
  mutate((chars, start, end) => {
    for (let i = start; i < end; i++) chars[i] = { ch: chars[i].ch, style: {} };
  });
};

// Reset to the default nick: the plain username, no formatting or paint.
const onReset = () => {
  const runs: NickRun[] = user.value?.name ? [{ text: props.defaultUsername }] : [];
  renderRuns(runs);
  emitModel(runs);
  updateActive();
};

// Typing: read the model back from the DOM, then re-render canonically so
// gradient/rainbow colors recompute for the new text — preserving the caret.
const syncFromDom = () => {
  const runs = readDom();
  const sel = offsets();
  renderRuns(runs);
  setSelection(sel.start, sel.end);
  emitModel(runs);
  updateActive();
};

// Keep the nick single-line and route the browser's native bold/italic/underline
// shortcuts through our model instead of letting it inject its own markup.
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') { e.preventDefault(); return; }
  if ((e.ctrlKey || e.metaKey) && !e.altKey) {
    const key = e.key.toLowerCase();
    const map: Record<string, DecoKey> = { b: 'bold', i: 'italic', u: 'underlined' };
    if (map[key]) { e.preventDefault(); onDecoration(map[key]); }
  }
};

// Paste as plain text (single line) so no foreign nodes enter the editor;
// execCommand fires an input event, so syncFromDom picks it up.
const onPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const text = (e.clipboardData?.getData('text/plain') ?? '').replace(/\r?\n/g, ' ');
  if (text) document.execCommand('insertText', false, text);
};

// ── active-mark highlighting for the toolbar ───────────────────────────────
const updateActive = () => {
  const el = editable.value;
  if (!el || document.activeElement !== el) return;
  const { start, end } = offsets();
  const chars = toChars(readDom());
  const seg = start === end
    ? (start > 0 ? [chars[start - 1]] : [])
    : chars.slice(start, end);
  const every = (k: DecoKey) => seg.length > 0 && seg.every((c) => c?.style[k]);
  active.value = {
    bold: every('bold'), italic: every('italic'), underlined: every('underlined'),
    strikethrough: every('strikethrough'), obfuscated: every('obfuscated'),
    paint: seg[0]?.style.paint,
  };
};

// ── obfuscation scramble ───────────────────────────────────────────────────
// Minecraft's obfuscated text cycles random glyphs. We can't scramble the live
// text while editing (it's the editable content + the model reads back from it),
// so we scramble only while the field is unfocused and restore the real text
// (kept in data-real) on focus. The real characters always survive.
const OBF_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const scramble = (s: string) =>
  Array.from(s, (c) => (c === ' ' ? c : OBF_CHARS[Math.floor(Math.random() * OBF_CHARS.length)])).join('');

const reduceMotion = () =>
  import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const scrambleTick = () => {
  const el = editable.value;
  if (!el || document.activeElement === el || reduceMotion()) return;
  for (const span of el.querySelectorAll<HTMLElement>('.nick-obf')) {
    const real = span.dataset.real ?? '';
    if (real) span.textContent = scramble(real);
  }
};

// On focus, put the real characters back so the user edits real text.
const restoreReal = () => {
  const el = editable.value;
  if (!el) return;
  for (const span of el.querySelectorAll<HTMLElement>('.nick-obf')) {
    if (span.dataset.real != null) span.textContent = span.dataset.real;
  }
};

// ── v-model in from parent (e.g. a freshly loaded nick) ────────────────────
let lastEmitted = '';
const loadFromModel = (value: string) => {
  if (value === lastEmitted) return; // ignore our own echo
  lastEmitted = value;
  renderRuns(parseMiniMessage(value));
};

watch(() => props.modelValue, loadFromModel);

// The model (lastEmitted) is the source of truth. If leaving the field left the
// DOM out of sync with it (e.g. a browser mangled the contenteditable), repaint
// from the model so unfocusing can only ever show the committed value.
const onBlur = () => {
  if (serializeRuns(readDom()) !== lastEmitted) {
    renderRuns(parseMiniMessage(lastEmitted));
  }
};

let scrambleTimer: ReturnType<typeof setInterval>;
onMounted(() => {
  renderRuns(parseMiniMessage(props.modelValue));
  lastEmitted = props.modelValue;
  document.addEventListener('selectionchange', updateActive);
  scrambleTimer = setInterval(scrambleTick, 70);
});
onBeforeUnmount(() => {
  document.removeEventListener('selectionchange', updateActive);
  window.clearInterval(scrambleTimer);
});
</script>

<style scoped>
@reference "~/assets/css/main.css";

.tb {
  @apply inline-flex items-center justify-center min-w-7 h-7 px-1.5 border-2 border-ink bg-snow text-ink text-sm cursor-pointer select-none;
}
.tb:hover { @apply bg-ice/30; }
.tb.on { @apply bg-ice text-ink; }

.nick-surface:empty::before {
  content: attr(data-placeholder);
  @apply text-white/50;
}
.nick-surface { caret-color: white; }

/* Obfuscated runs scramble their glyphs while the field is unfocused (see the
   scramble tick in script). While focused they show real text for editing; the
   dotted underline marks them as obfuscated in both states. */
.nick-obf { text-decoration: underline dotted; }
</style>
