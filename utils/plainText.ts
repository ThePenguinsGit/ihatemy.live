// Drops MiniMessage tags (<gold>, <gradient:…>, …) for places that need plain
// text: aria labels, and the fallback when the backend's renderer didn't answer.
export const stripMiniMessage = (source: string): string =>
  source.replace(/<[^<>]*>/g, '');
