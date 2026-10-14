import type CosmeticItemInterface from '~/interfaces/CosmeticItemInterface';
import { cosmeticSoundFilesOf, pickSoundFile } from '~/utils/cosmetics';

// Vanilla sounds range from a soft click to a blast; this keeps the loud ones
// bearable on a website.
const BASE_VOLUME = 0.5;
const AUTOPLAY_STORAGE_KEY = 'cosmetics-play-on-pick';

// One player for the whole page, so starting a sound stops the last one.
let audio: HTMLAudioElement | null = null;
// Mojang's files are Ogg Vorbis, which Safari only plays from 18.4. Checked
// once, on the client; the server never shows a play button.
let oggSupported: boolean | undefined;
const canPlayOgg = () => {
  if (import.meta.server) return false;
  oggSupported ??= new Audio().canPlayType('audio/ogg; codecs=vorbis') !== '';
  return oggSupported;
};

// Previews for SOUND cosmetics, played the way the game plays them: one of the
// item's files picked by weight, pitched by changing the speed. A plain <audio>
// rather than Web Audio, since Mojang's server sends no CORS headers.
export const useCosmeticSound = () => {
  const playingId = useState<string | null>('cosmetic-sound-playing', () => null);
  // Whether picking a sound in the shop plays it. Remembered per browser.
  const playOnPick = useState<boolean>('cosmetic-sound-play-on-pick', () => {
    if (import.meta.server) return true;
    try {
      return localStorage.getItem(AUTOPLAY_STORAGE_KEY) !== 'off';
    } catch {
      return true;
    }
  });

  watch(playOnPick, (on) => {
    try {
      localStorage.setItem(AUTOPLAY_STORAGE_KEY, on ? 'on' : 'off');
    } catch {
      // Storage blocked; it's only a preference.
    }
  });

  const player = () => {
    if (!audio) {
      audio = new Audio();
      audio.preload = 'auto';
      const done = () => { playingId.value = null; };
      audio.addEventListener('ended', done);
      audio.addEventListener('error', done);
    }
    return audio;
  };

  const canPlay = (item: CosmeticItemInterface | undefined) => canPlayOgg() && cosmeticSoundFilesOf(item) !== null;
  const isPlaying = (item: CosmeticItemInterface | undefined) => !!item && playingId.value === item.id;

  const stop = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    playingId.value = null;
  };

  const play = async (item: CosmeticItemInterface) => {
    const files = cosmeticSoundFilesOf(item);
    const file = files && pickSoundFile(files);
    if (!file || !canPlayOgg()) return;
    const el = player();
    stop();
    el.src = file.url;
    el.volume = BASE_VOLUME * Math.min(1, Math.max(0, file.volume));
    el.preservesPitch = false;
    // Browsers only allow 0.0625–16; the game stays within 0.5–2.
    el.playbackRate = Math.min(4, Math.max(0.25, file.pitch || 1));
    playingId.value = item.id;
    try {
      await el.play();
    } catch {
      // Blocked, or the file didn't load: just show it as stopped.
      if (playingId.value === item.id) playingId.value = null;
    }
  };

  const toggle = (item: CosmeticItemInterface) => (isPlaying(item) ? stop() : play(item));

  return { playingId, playOnPick, canPlay, isPlaying, play, stop, toggle };
};
