import type { NickRun, NickPaint } from '../interfaces/NickRun';

// ── MiniMessage <-> styled-runs conversion ─────────────────────────────────
// Kept intentionally small: only the subset the nick editor can produce
// (bold/italic/underline/strike/obfuscated + color/gradient/rainbow). The
// parser falls back to plain text on anything it doesn't understand, so it can
// never throw on an unexpected stored nick.

// The 16 vanilla named colors (plus british spellings) MiniMessage accepts.
export const NAMED_COLORS = [
  'black', 'dark_blue', 'dark_green', 'dark_aqua', 'dark_red', 'dark_purple',
  'gold', 'gray', 'grey', 'dark_gray', 'dark_grey', 'blue', 'green', 'aqua',
  'red', 'light_purple', 'yellow', 'white',
] as const;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const isColorToken = (t: string): boolean =>
  HEX_RE.test(t) || (NAMED_COLORS as readonly string[]).includes(t.toLowerCase());

// Decorations in a stable outer→inner order for deterministic output.
const DECORATIONS: { key: keyof NickRun; open: string; close: string }[] = [
  { key: 'bold', open: '<b>', close: '</b>' },
  { key: 'italic', open: '<i>', close: '</i>' },
  { key: 'underlined', open: '<u>', close: '</u>' },
  { key: 'strikethrough', open: '<st>', close: '</st>' },
  { key: 'obfuscated', open: '<obf>', close: '</obf>' },
];

const escapeText = (text: string): string =>
  text.replace(/\\/g, '\\\\').replace(/</g, '\\<');

const unescapeText = (text: string): string =>
  text.replace(/\\(.)/g, '$1');

const paintTags = (paint: NickPaint): { open: string; close: string } | null => {
  switch (paint.type) {
    case 'color':
      return { open: `<color:${paint.value}>`, close: '</color>' };
    case 'gradient':
      if (paint.colors.length < 2) {
        // not a valid gradient — degrade to the first color if present
        return paint.colors[0]
          ? { open: `<color:${paint.colors[0]}>`, close: '</color>' }
          : null;
      }
      return { open: `<gradient:${paint.colors.join(':')}>`, close: '</gradient>' };
    case 'rainbow':
      return { open: '<rainbow>', close: '</rainbow>' };
  }
};

const sameStyle = (a: NickRun, b: NickRun): boolean =>
  !!a.bold === !!b.bold &&
  !!a.italic === !!b.italic &&
  !!a.underlined === !!b.underlined &&
  !!a.strikethrough === !!b.strikethrough &&
  !!a.obfuscated === !!b.obfuscated &&
  JSON.stringify(a.paint ?? null) === JSON.stringify(b.paint ?? null);

// Merge adjacent runs that share identical styling — keeps output tidy.
const collapse = (runs: NickRun[]): NickRun[] => {
  const out: NickRun[] = [];
  for (const run of runs) {
    if (run.text === '') continue;
    const last = out[out.length - 1];
    if (last && sameStyle(last, run)) last.text += run.text;
    else out.push({ ...run });
  }
  return out;
};

interface Tag { id: string; open: string; close: string }

// The tags a run needs, outermost → innermost (paint always wraps decorations).
const tagsFor = (run: NickRun): Tag[] => {
  const tags: Tag[] = [];
  if (run.paint) {
    const t = paintTags(run.paint);
    if (t) tags.push({ id: `paint:${JSON.stringify(run.paint)}`, ...t });
  }
  for (const d of DECORATIONS) {
    if (run[d.key]) tags.push({ id: d.key as string, open: d.open, close: d.close });
  }
  return tags;
};

/**
 * Serialize styled runs to a MiniMessage string, keeping tags that persist
 * across adjacent runs open (nesting) instead of closing and reopening them.
 * e.g. rainbow over "abcdefg" with "de" bold →
 *   <rainbow>abc<b>de</b>fg</rainbow>   (not three separate <rainbow> spans)
 * This matters for gradient/rainbow, which restart per tag in MiniMessage.
 */
export const serializeRuns = (runs: NickRun[]): string => {
  const stack: Tag[] = [];
  let out = '';
  for (const run of collapse(runs)) {
    const want = tagsFor(run);
    // longest common prefix of already-open tags and wanted tags
    let common = 0;
    while (common < stack.length && common < want.length && stack[common].id === want[common].id) common++;
    // close everything opened below the common prefix (innermost first)
    for (let i = stack.length - 1; i >= common; i--) out += stack[i].close;
    stack.length = common;
    // open the remaining wanted tags
    for (let i = common; i < want.length; i++) { out += want[i].open; stack.push(want[i]); }
    out += escapeText(run.text);
  }
  for (let i = stack.length - 1; i >= 0; i--) out += stack[i].close;
  return out;
};

// Remove every tag, leaving only unescaped literal text — the parse fallback.
const stripToPlain = (src: string): NickRun[] => {
  let text = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\' && i + 1 < src.length) { text += src[++i]; continue; }
    if (ch === '<') { // skip to matching '>'
      const end = src.indexOf('>', i);
      if (end === -1) { text += src.slice(i); break; }
      i = end;
      continue;
    }
    text += ch;
  }
  return text ? [{ text }] : [];
};

type OpenTag =
  | { kind: 'decoration'; key: keyof NickRun }
  | { kind: 'paint'; prev: NickPaint | undefined }
  | { kind: 'reset'; prev: Partial<NickRun> };

/**
 * Parse a MiniMessage string into styled runs. Understands only the editor's
 * own subset; on any unsupported tag it returns the plain-text fallback so an
 * unexpected nick from the backend can still be loaded (just unstyled).
 */
export const parseMiniMessage = (src: string): NickRun[] => {
  const runs: NickRun[] = [];
  const state: NickRun = { text: '' };
  const stack: { name: string; undo: () => void }[] = [];
  let buffer = '';

  const flush = () => {
    if (buffer === '') return;
    runs.push({ ...state, text: buffer });
    buffer = '';
  };

  const openDecoration = (name: string, key: keyof NickRun) => {
    flush();
    const had = state[key];
    (state as Record<string, unknown>)[key] = true;
    stack.push({ name, undo: () => { (state as Record<string, unknown>)[key] = had; } });
  };

  const openPaint = (name: string, paint: NickPaint) => {
    flush();
    const prev = state.paint;
    state.paint = paint;
    stack.push({ name, undo: () => { state.paint = prev; } });
  };

  const closeTag = (name: string) => {
    flush();
    // pop the nearest matching open tag; ignore stray closers
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].name === name) {
        stack[i].undo();
        stack.splice(i, 1);
        return true;
      }
    }
    return true; // stray close tag — tolerate
  };

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (ch === '\\' && i + 1 < src.length) { buffer += src[++i]; continue; }
    if (ch !== '<') { buffer += ch; continue; }

    const end = src.indexOf('>', i);
    if (end === -1) { buffer += src.slice(i); break; }
    const raw = src.slice(i + 1, end).trim();
    i = end;

    const closing = raw.startsWith('/');
    const body = closing ? raw.slice(1) : raw;
    const [head, ...argParts] = body.split(':');
    const tag = head.toLowerCase();
    const args = argParts.join(':');

    if (closing) {
      // normalize the close-tag name to how we stored the opener
      const canonical =
        ({ bold: 'b', italic: 'i', em: 'i', underlined: 'u', strikethrough: 'st',
           obfuscated: 'obf' } as Record<string, string>)[tag] ?? tag;
      closeTag(canonical === 'color' || isColorToken(tag) ? 'paint' :
        ['gradient', 'rainbow'].includes(canonical) ? 'paint' : canonical);
      continue;
    }

    switch (tag) {
      case 'b': case 'bold': openDecoration('b', 'bold'); break;
      case 'i': case 'italic': case 'em': openDecoration('i', 'italic'); break;
      case 'u': case 'underlined': openDecoration('u', 'underlined'); break;
      case 'st': case 'strikethrough': openDecoration('st', 'strikethrough'); break;
      case 'obf': case 'obfuscated': openDecoration('obf', 'obfuscated'); break;
      case 'reset':
        flush();
        state.bold = state.italic = state.underlined = undefined;
        state.strikethrough = state.obfuscated = undefined;
        state.paint = undefined;
        break;
      case 'rainbow':
        openPaint('paint', { type: 'rainbow' });
        break;
      case 'gradient': {
        const colors = args.split(':').filter(isColorToken);
        if (colors.length < 2) return stripToPlain(src);
        openPaint('paint', { type: 'gradient', colors });
        break;
      }
      case 'color': {
        if (!isColorToken(args)) return stripToPlain(src);
        openPaint('paint', { type: 'color', value: args });
        break;
      }
      default:
        // bare named color or bare hex, e.g. <red> or <#ff0000>
        if (isColorToken(tag) && args === '') {
          openPaint('paint', { type: 'color', value: HEX_RE.test(head) ? head : tag });
        } else {
          return stripToPlain(src); // unsupported tag → safe fallback
        }
    }
  }

  flush();
  return collapse(runs);
};
