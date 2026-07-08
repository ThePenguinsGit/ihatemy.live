<template>
  <svg
    :viewBox="`0 0 ${cols} ${rowsGrid.length}`"
    width="1em"
    height="1em"
    fill="currentColor"
    shape-rendering="crispEdges"
    class="inline-block align-[-0.125em]"
    aria-hidden="true"
    focusable="false"
  >
    <rect v-for="(r, i) in rects" :key="i" :x="r.x" :y="r.y" :width="r.w" height="1" />
  </svg>
</template>

<script setup lang="ts">
// Pixel-art icons drawn on an integer grid so they render with hard, blocky
// edges (shape-rendering="crispEdges") to match the Minecraft-GUI panels and
// buttons — unlike the smooth FontAwesome vectors they replace. Each icon is a
// 16×16 bitmap; '#' = filled cell. `currentColor` + 1em sizing make them behave
// like a font glyph (inherit text color and font-size).
const ICONS: Record<string, string[]> = {
  // Three chunky bars (hamburger).
  menu: [
    '................',
    '................',
    '................',
    '..############..',
    '..############..',
    '................',
    '................',
    '..############..',
    '..############..',
    '................',
    '................',
    '..############..',
    '..############..',
    '................',
    '................',
    '................',
  ],
  // Stair-stepped X.
  close: [
    '##............##',
    '##............##',
    '..##........##..',
    '..##........##..',
    '....##....##....',
    '....##....##....',
    '......####......',
    '......####......',
    '......####......',
    '......####......',
    '....##....##....',
    '....##....##....',
    '..##........##..',
    '..##........##..',
    '##............##',
    '##............##',
  ],
  // Door bracket with an arrow leaving to the right (log out).
  logout: [
    '................',
    '................',
    '..######........',
    '..######........',
    '..##............',
    '..##.......#....',
    '..##.......##...',
    '..##.#########..',
    '..##.#########..',
    '..##.......##...',
    '..##.......#....',
    '..##............',
    '..######........',
    '..######........',
    '................',
    '................',
  ],
}

const props = defineProps<{ name: keyof typeof ICONS | string }>()

const rowsGrid = computed(() => ICONS[props.name] ?? [])
const cols = computed(() => rowsGrid.value[0]?.length ?? 16)

// Merge consecutive filled cells in each row into a single <rect> so an icon is
// a handful of rects instead of dozens of 1×1 squares.
const rects = computed(() => {
  const out: { x: number; y: number; w: number }[] = []
  rowsGrid.value.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] === '#') {
        let w = 1
        while (row[x + w] === '#') w++
        out.push({ x, y, w })
        x += w
      } else {
        x++
      }
    }
  })
  return out
})
</script>
