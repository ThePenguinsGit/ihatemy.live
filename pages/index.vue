<template>
  <div class="px-5 ">
    <iframe src="https://ko-fi.com/streamalerts/goaloverlay/sa_ed47c804-d1a7-4e42-ba00-1edff9d3e40d" class="w-full" height="57" />
    <div class="flex flex-col xl:flex-row gap-4 pt-4">
      <iframe class="hidden xl:block" src="https://discordapp.com/widget?id=637719625274228743&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
      <div>
        <a class="block xl:hidden w-fit" href="https://discord.gg/penguinnetwork">
          <img class="text-white" src="https://discord.com/api/guilds/637719625274228743/widget.png?style=banner2" alt="Join our Discord (p.s. this image can't be shown because it was blocked by your browser)"/>
        </a>
      </div>
      <div class="flex flex-col gap-5 flex-grow">
        <AliveServerRow name="MC Eternal 2" version="1.2.0.2" image-path="/img/mce2-2.png" hostname="mce2.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="Society: Sunlit Valley" version="3.4.2" image-path="/img/sv.png" hostname="sv.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="Prominence 2" version="3.9.12" image-path="/img/p2he.png" hostname="p2he.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="All The Mods 10" version="5.1" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="All The Mods 9" version="1.1.1" image-path="/img/atm9.png" hostname="atm9.ihatemy.live" mapUrl='https://atm9.ihatemy.live'/>
        <DedServerRow name=" 🦀" reason-of-death="died of dead" image-path="/img/crab.png" download-path="https://map-storage.ihatemy.live/maps/crab.zip" />
        <DedServerRow name="MC Eternal (2)" reason-of-death="shitted and cummed" image-path="/img/mce2.png" download-path="https://map-storage.ihatemy.live/maps/mce2.zip" />
        <DedServerRow name="MC Eternal" reason-of-death="died of robot uprising" image-path="/img/mce.png" download-path="https://map-storage.ihatemy.live/maps/mce.zip" />
        <DedServerRow name="SkyFactory 4" reason-of-death="died of boredom" image-path="/img/sf4.png" download-path="https://map-storage.ihatemy.live/maps/sf4.zip" />
        <DedServerRow name="Enigmatica 2: Expert - E2E" reason-of-death="died of a nasty adderall & caffeine overdose" image-path="/img/e2e.png" download-path="https://map-storage.ihatemy.live/maps/e2e.zip" />
        <DedServerRow name="The 1.12.2 Pack" reason-of-death="sharted itself" image-path="/img/1122.png" download-path="https://map-storage.ihatemy.live/maps/1122.zip" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: `ihatemy.live`,
  meta: [
    { name: 'description', content: 'The Penguin Network - for all your modded Minecraft Server needs! See what current or past servers we had and find one that suits you needs!' },
  ],
})
</script>
