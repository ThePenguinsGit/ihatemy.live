import type { Ref, WatchSource } from 'vue'

const STYLE_OPTIONS: Record<string, Intl.DateTimeFormatOptions> = {
    t: { timeStyle: 'short' },
    T: { timeStyle: 'medium' },
    d: { dateStyle: 'short' },
    D: { dateStyle: 'long' },
    f: { dateStyle: 'long', timeStyle: 'short' },
    F: { dateStyle: 'full', timeStyle: 'short' },
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
]

// Client-side upgrades for v-html'd `contentHtml` fragments (see
// rendering-discord-markup.md): localize <time class="timestamp"> to the
// viewer's locale/timezone — including true relative rendering for style
// "R", which the server can only bake as a stale fallback — and
// optionally click-to-reveal spoilers. Runs post-hydration only, and
// never mutates the injected HTML string itself, so SSR stays stable.
// `source` re-runs the work when the injected HTML changes or the
// container (re)appears (the lightbox is v-if-gated).
export function useDiscordMarkup(
    container: Ref<HTMLElement | null | undefined>,
    opts: { spoilers?: boolean, source?: WatchSource } = {},
) {
    const localizeTimestamps = () => {
        const root = container.value
        if (!root) return
        for (const el of root.querySelectorAll<HTMLTimeElement>('time.timestamp')) {
            const date = new Date(el.dateTime)
            if (Number.isNaN(date.getTime())) continue
            const style = el.dataset.format ?? 'f'
            if (style === 'R') {
                const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
                const diffSeconds = (date.getTime() - Date.now()) / 1000
                const [unit, size] = RELATIVE_UNITS.find(([, s]) => Math.abs(diffSeconds) >= s)
                    ?? ['second', 1]
                el.textContent = rtf.format(Math.round(diffSeconds / size), unit)
            }
            else {
                el.textContent = new Intl.DateTimeFormat(undefined, STYLE_OPTIONS[style] ?? STYLE_OPTIONS.f).format(date)
            }
            el.title = date.toLocaleString()
        }
    }

    // First click reveals; stop it from also triggering card/dialog
    // handlers. Already-revealed spoilers let clicks through.
    const onClick = (event: Event) => {
        const spoiler = (event.target as Element).closest?.('.spoiler')
        if (!spoiler || spoiler.classList.contains('revealed')) return
        spoiler.classList.add('revealed')
        event.stopPropagation()
    }

    // The container element can be replaced or appear late (v-if), so
    // (re)attach on every enhance; remove first to guard double-adds.
    let attachedTo: HTMLElement | null = null
    const enhance = () => {
        localizeTimestamps()
        if (!opts.spoilers) return
        if (attachedTo === container.value) return
        attachedTo?.removeEventListener('click', onClick)
        attachedTo = container.value ?? null
        attachedTo?.addEventListener('click', onClick)
    }

    onMounted(enhance)
    onBeforeUnmount(() => attachedTo?.removeEventListener('click', onClick))

    if (opts.source) {
        watch(opts.source, () => nextTick(enhance))
    }
}
