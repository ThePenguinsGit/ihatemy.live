import type { NickRun, NickPaint } from '~/interfaces/NickRun';

// Turning nick runs into on-screen colors, shared by the nick editor and the
// cosmetics previews so a nick looks the same everywhere on the site.

type NickStyle = Omit<NickRun, 'text'>;
interface NickChar { ch: string; style: NickStyle }

// Vanilla Minecraft named colors → hex, for on-screen rendering only.
export const MC_HEX: Record<string, string> = {
  black: '#000000', dark_blue: '#0000AA', dark_green: '#00AA00', dark_aqua: '#00AAAA',
  dark_red: '#AA0000', dark_purple: '#AA00AA', gold: '#FFAA00', gray: '#AAAAAA',
  grey: '#AAAAAA', dark_gray: '#555555', dark_grey: '#555555', blue: '#5555FF',
  green: '#55FF55', aqua: '#55FFFF', red: '#FF5555', light_purple: '#FF55FF',
  yellow: '#FFFF55', white: '#FFFFFF',
};

export const cssColor = (v: string) => (v.startsWith('#') ? v : MC_HEX[v.toLowerCase()] ?? v);

export const nickStyleKey = (s: NickStyle) => JSON.stringify({
  b: !!s.bold, i: !!s.italic, u: !!s.underlined, s: !!s.strikethrough,
  o: !!s.obfuscated, p: s.paint ?? null,
});

export const toNickChars = (runs: NickRun[]): NickChar[] => {
  const chars: NickChar[] = [];
  for (const { text, ...style } of runs) {
    for (let i = 0; i < text.length; i++) chars.push({ ch: text[i]!, style });
  }
  return chars;
};

// ── per-character colors for gradient/rainbow ──────────────────────────────
// Minecraft colors each character a single solid color; we mirror that instead
// of a smooth CSS gradient. Colors are computed across the whole contiguous
// paint span, so bolding part of it doesn't restart or shift the colors.
const RAINBOW_SPAN = 300; // degrees of hue swept across a rainbow run

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1]!, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const rgbCss = (r: number, g: number, b: number) => `rgb(${r | 0}, ${g | 0}, ${b | 0})`;

const gradientAt = (stops: string[], t: number): string => {
  if (stops.length === 1) return stops[0]!;
  const seg = t * (stops.length - 1);
  const idx = Math.min(Math.floor(seg), stops.length - 2);
  const f = seg - idx;
  const a = hexToRgb(stops[idx]!);
  const b = hexToRgb(stops[idx + 1]!);
  return rgbCss(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
};

const samePaint = (a?: NickPaint, b?: NickPaint) =>
  JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

// One solid color per character (undefined = inherit white).
export const computeCharColors = (chars: NickChar[]): (string | undefined)[] => {
  const out = new Array<string | undefined>(chars.length);
  let i = 0;
  while (i < chars.length) {
    const paint = chars[i]!.style.paint;
    if (!paint) { out[i++] = undefined; continue; }
    if (paint.type === 'color') { out[i++] = cssColor(paint.value); continue; }
    // gradient / rainbow: color each char by its position within the whole span
    let j = i;
    while (j < chars.length && samePaint(chars[j]!.style.paint, paint)) j++;
    const n = j - i;
    const stops = paint.type === 'gradient' ? paint.colors.map(cssColor) : [];
    for (let k = 0; k < n; k++) {
      const t = n <= 1 ? 0 : k / (n - 1);
      out[i + k] = paint.type === 'rainbow'
        ? `hsl(${Math.round(t * RAINBOW_SPAN)}, 90%, 60%)`
        : gradientAt(stops, t);
    }
    i = j;
  }
  return out;
};

export interface NickSegment { text: string; style: NickStyle; color?: string }

// Runs → the fewest spans that keep every character's own color and style.
export const nickSegments = (runs: NickRun[]): NickSegment[] => {
  const chars = toNickChars(runs);
  const colors = computeCharColors(chars);
  const segs: NickSegment[] = [];
  let sig: string | null = null;
  for (let i = 0; i < chars.length; i++) {
    const color = colors[i];
    const key = `${nickStyleKey(chars[i]!.style)}|${color ?? ''}`;
    const last = segs[segs.length - 1];
    if (last && key === sig) last.text += chars[i]!.ch;
    else { segs.push({ text: chars[i]!.ch, style: chars[i]!.style, color }); sig = key; }
  }
  return segs;
};

// Inline CSS for a segment, the same look the nick editor gives it.
export const nickSegmentStyle = (seg: NickSegment): Record<string, string> => {
  const css: Record<string, string> = {};
  if (seg.color) css.color = seg.color;
  if (seg.style.bold) css.fontWeight = 'bold';
  if (seg.style.italic) css.fontStyle = 'italic';
  const deco = [seg.style.underlined && 'underline', seg.style.strikethrough && 'line-through'].filter(Boolean);
  if (deco.length) css.textDecoration = deco.join(' ');
  return css;
};
