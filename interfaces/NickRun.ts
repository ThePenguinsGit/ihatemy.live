// A nickname is modelled internally as an ordered list of styled runs.
// The editor edits runs; MiniMessage markup is derived from them only on save
// (see utils/miniMessage.ts) and is never shown to the user.

// color / gradient / rainbow are mutually exclusive — a run has at most one paint.
export type NickPaint =
  | { type: 'color'; value: string }        // named color (e.g. "red") or "#rrggbb"
  | { type: 'gradient'; colors: string[] }  // 2+ stops, each named or "#rrggbb"
  | { type: 'rainbow' };

export interface NickRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underlined?: boolean;
  strikethrough?: boolean;
  obfuscated?: boolean;
  paint?: NickPaint;
}
