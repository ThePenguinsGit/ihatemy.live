<template>
  <div class="px-5 ">
    <iframe src="https://ko-fi.com/streamalerts/goaloverlay/sa_ed47c804-d1a7-4e42-ba00-1edff9d3e40d" class="w-full" height="57" />
    <div class="flex flex-col xl:flex-row gap-4 pt-4">
      <iframe class="hidden xl:block" src="https://discordapp.com/widget?id=637719625274228743&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
      <div>
        <a class="block xl:hidden w-fit" href="https://discord.gg/QerZux9gyM">
          <img class="text-white" src="https://discord.com/api/guilds/637719625274228743/widget.png?style=banner2" alt="Join our Discord (p.s. this image can't be shown because it was blocked by your browser)"/>
        </a>
      </div>
      <div class="flex flex-col gap-5 flex-grow">
        <AliveServerRow name="All The Mods 10" version="2.42" image-path="/img/atm10.png" hostname="atm10.ihatemy.live" mapUrl='https://atm10.ihatemy.live'/>
        <AliveServerRow name="All The Mods 9" version="1.0.7" image-path="/img/atm9.png" hostname="atm9.ihatemy.live" mapUrl='https://atm9.ihatemy.live'/>
        <DedServerRow name=" 🦀" reason-of-death="died of dead" image-path="/img/crab.png" download-path="https://map-storage.ihatemy.live/maps/crab.zip" />
        <DedServerRow name="MC Eternal 2" reason-of-death="shitted and cummed" image-path="/img/mce2.png" download-path="https://map-storage.ihatemy.live/maps/mce2.zip" />
        <DedServerRow name="MC Eternal" reason-of-death="died of robot uprising" image-path="/img/mce.png" download-path="https://map-storage.ihatemy.live/maps/mce.zip" />
        <DedServerRow name="SkyFactory 4" reason-of-death="died of boredom" image-path="/img/sf4.png" download-path="https://map-storage.ihatemy.live/maps/sf4.zip" />
        <DedServerRow name="Enigmatica 2: Expert - E2E" reason-of-death="died of a nasty adderall & caffeine overdose" image-path="/img/e2e.png" download-path="https://map-storage.ihatemy.live/maps/e2e.zip" />
        <DedServerRow name="The 1.12.2 Pack" reason-of-death="sharted itself" image-path="/img/1122.png" download-path="https://map-storage.ihatemy.live/maps/1122.zip" />
      </div>
    </div>
  </div>
</template>
