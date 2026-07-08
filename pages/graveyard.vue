<template>
  <div class="flex mx-auto flex-col gap-4 grow max-w-7xl w-full">
    <div class="flex items-baseline justify-between mb-1">
      <h1 class="font-[minecraft] text-3xl md:text-4xl uppercase text-white drop-shadow">The Graveyard</h1>
      <NuxtLink to="/" class="eyebrow !text-ice hover:underline">← Live servers</NuxtLink>
    </div>
    <p class="text-white/80 -mt-2 mb-2">Worlds we've laid to rest. Grab the map to reminiscence the good times.</p>
    <DedServerRow name="All The Mods 9" reason-of-death="died by popular demand" image-path="/img/atm9.png" download-path="https://map-storage.ihatemy.live/maps/atm9.zip" :content-length-of-download="72505212944"/>
    <DedServerRow name=" 🦀" reason-of-death="died of dead" image-path="/img/crab.png" download-path="https://map-storage.ihatemy.live/maps/crab.zip" :content-length-of-download="6248410954" />
    <DedServerRow name="MC Eternal (2)" reason-of-death="shitted and cummed" image-path="/img/mce-2.png" download-path="https://map-storage.ihatemy.live/maps/mce2.zip" :content-length-of-download="32743256695" />
    <DedServerRow name="MC Eternal" reason-of-death="died of robot uprising" image-path="/img/mce.png" download-path="https://map-storage.ihatemy.live/maps/mce.zip" :content-length-of-download="83815875146" />
    <DedServerRow name="SkyFactory 4" reason-of-death="died of boredom" image-path="/img/sf4.png" download-path="https://map-storage.ihatemy.live/maps/sf4.zip" :content-length-of-download="17420841635" />
    <DedServerRow name="Enigmatica 2: Expert - E2E" reason-of-death="died of a nasty adderall & caffeine overdose" image-path="/img/e2e.png" download-path="https://map-storage.ihatemy.live/maps/e2e.zip" :content-length-of-download="29327122573" />
    <DedServerRow name="The 1.12.2 Pack" reason-of-death="sharted itself" image-path="/img/1122.png" download-path="https://map-storage.ihatemy.live/maps/1122.zip" :content-length-of-download="10994627339" />
  </div>
</template>
<script setup lang="ts">
</script>