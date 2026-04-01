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
        <AliveServerRow name="ATM10: To the Sky" version="2.0.0" image-path="/img/atm10tts.png" hostname="atm10tts.ihatemy.live" mapUrl='https://maps.ihatemy.live/atm10tts'/>
        <AliveServerRow name="All The Mods 10" version="6.2.1" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://maps.ihatemy.live/atm10'/>
        <AliveServerRow name="GregTech: New Horizons" version="2.8.4" image-path="/img/gtnh.png" hostname="gtnh.ihatemy.live" mapUrl='https://maps.ihatemy.live/gtnh'/>
        <AliveServerRow name="MC Eternal 2" version="1.2.0.3" image-path="/img/mce2-2.png" hostname="mce2.ihatemy.live" mapUrl='https://maps.ihatemy.live/mce2'/>
        <AliveServerRow name="Prominence 2" version="3.9.21" image-path="/img/p2he.png" hostname="p2he.ihatemy.live" mapUrl='https://maps.ihatemy.live/p2he'/>
        <AliveServerRow name="Society: Sunlit Valley" version="4.0.4" image-path="/img/sv.png" hostname="sv.ihatemy.live" mapUrl='https://maps.ihatemy.live/sv'/>
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
