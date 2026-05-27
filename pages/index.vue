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
        <AliveServerRow name="ATM10: To the Sky" version="2.0.2" image-path="/img/atm10tts.png" hostname="atm10tts.ihatemy.live" mapUrl='https://maps.ihatemy.live/atm10tts'/>
        <AliveServerRow name="All The Mods 10" version="7.0" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://maps.ihatemy.live/atm10'/>
        <AliveServerRow name="GregTech: New Horizons" version="2.8.4" image-path="/img/gtnh.png" hostname="gtnh.ihatemy.live" mapUrl='https://maps.ihatemy.live/gtnh'/>
        <AliveServerRow name="MC Eternal 2" version="1.2.0.4" image-path="/img/mce2-2.png" hostname="mce2.ihatemy.live" mapUrl='https://maps.ihatemy.live/mce2'/>
        <AliveServerRow name="Prominence 2" version="3.9.27" image-path="/img/p2he.png" hostname="p2he.ihatemy.live" mapUrl='https://maps.ihatemy.live/p2he'/>
        <AliveServerRow name="StoneBlock 4" version="1.14.0" image-path="/img/sb4.png" hostname="sb4.ihatemy.live" mapUnavailableReason="It's underground, duh"/>
        <AliveServerRow name="Society: Sunlit Valley" version="4.0.8" image-path="/img/sv.png" hostname="sv.ihatemy.live" mapUrl='https://maps.ihatemy.live/sv'/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: `The Penguin Network`,
  meta: [
    {
      name: 'description',
      content: 'Welcome to The Penguin Network - A friendly modded Minecraft community perfect for new and experienced players! Join our active servers including ATM10: To the Sky, All The Mods 10, GregTech: New Horizons, MC Eternal 2, Prominence 2, and Society: Sunlit Valley. Everyone is welcome!'
    },
  ],
})
</script>
