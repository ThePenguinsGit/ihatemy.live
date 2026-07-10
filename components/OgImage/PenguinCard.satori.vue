<script setup lang="ts">
// Social-share card (1200×600, the module's default canvas) rendered by nuxt-og-image through satori.
// Satori only understands a flexbox subset with inline styles: every element
// with children needs explicit display:flex, no CSS files, no box-shadow —
// hence the .panel-dark bevel is rebuilt from absolutely-positioned strips.
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  eyebrow?: string
}>(), {
  title: 'The Penguin Network',
  description: 'A friendly modded Minecraft community. Free, public servers — no whitelist, no paywall.',
  eyebrow: 'ihatemy.live',
})

// Palette from assets/css/main.css @theme — satori can't read it, keep in sync.
const ink = '#14181f'
const surface = '#2b303a'
const ice = '#5ec2e6'
const beak = '#f6a623'

// Everything is 2× the site's proportions (site panel: 4px border, 3px bevel).
const bevel = 6

const fontSize = computed(() => (props.title.length > 24 ? 56 : 76))
const shortDescription = computed(() =>
  props.description.length > 150 ? `${props.description.slice(0, 147)}…` : props.description,
)
</script>

<template>
  <div :style="{ width: '1200px', height: '600px', display: 'flex', backgroundColor: ink, position: 'relative' }">
    <!-- Site background, dimmed so the panel carries the card -->
    <img
      src="/img/background.png"
      :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '600px', objectFit: 'cover' }"
    />
    <div :style="{ position: 'absolute', top: '0', left: '0', width: '1200px', height: '600px', backgroundColor: 'rgba(20, 24, 31, 0.78)', display: 'flex' }" />

    <!-- The .panel-dark slab -->
    <div :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'absolute', top: '48px', left: '56px', width: '1088px', height: '504px', backgroundColor: surface, border: `8px solid ${ink}`, padding: '44px 56px' }">
      <!-- Bevel: light top/left, dark bottom/right (inset box-shadow substitute) -->
      <div :style="{ position: 'absolute', top: '0', left: '0', width: '1072px', height: `${bevel}px`, backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex' }" />
      <div :style="{ position: 'absolute', top: '0', left: '0', width: `${bevel}px`, height: '488px', backgroundColor: 'rgba(255,255,255,0.12)', display: 'flex' }" />
      <div :style="{ position: 'absolute', bottom: '0', left: '0', width: '1072px', height: `${bevel}px`, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex' }" />
      <div :style="{ position: 'absolute', top: '0', right: '0', width: `${bevel}px`, height: '488px', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex' }" />

      <div :style="{ display: 'flex', flexDirection: 'column' }">
        <div :style="{ display: 'flex', fontFamily: 'Minecraft', fontSize: '26px', color: ice, textTransform: 'uppercase', letterSpacing: '5px' }">
          {{ eyebrow }}
        </div>
        <div :style="{ display: 'flex', fontFamily: 'Minecraft', fontSize: `${fontSize}px`, color: '#ffffff', lineHeight: 1.1, marginTop: '20px' }">
          {{ title }}
        </div>
        <div :style="{ display: 'flex', fontFamily: 'Inter', fontSize: '30px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, marginTop: '24px', maxWidth: '900px' }">
          {{ shortDescription }}
        </div>
      </div>

      <div :style="{ display: 'flex', alignItems: 'center' }">
        <img src="/logo_big.png" :style="{ width: '56px', height: '56px' }" />
        <div :style="{ display: 'flex', fontFamily: 'Minecraft', fontSize: '32px', color: beak, marginLeft: '20px' }">
          ihatemy.live
        </div>
      </div>
    </div>
  </div>
</template>
