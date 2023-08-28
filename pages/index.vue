<template>
  <div class="px-5 flex flex-col xl:flex-row gap-4 pt-10">
    <iframe class="hidden xl:block" src="https://discordapp.com/widget?id=637719625274228743&theme=dark" width="350" height="500" allowtransparency="true" frameborder="0" sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"></iframe>
    <div>
      <a class="block xl:hidden w-fit" href="https://discord.gg/QerZux9gyM">
        <img class="text-white" src="https://discord.com/api/guilds/637719625274228743/widget.png?style=banner2" alt="Join our Discord (p.s. this image can't be shown because it was blocked by your browser)"/>
      </a>
    </div>
    <div class="flex flex-col gap-5 flex-grow">
      <AliveServerRow name="🦀" image-path="/img/crab.png" hostname="crab.ihatemy.live"/>
      <DedServerRow name="MC Eternal 2" reason-of-death="shitted and cummed" image-path="/img/mce2.png" download-path="https://s3.eu-central-1.wasabisys.com/penguins-maps/maps/mce2.zip" />
      <DedServerRow name="MC Eternal" reason-of-death="died of robot uprising" image-path="/img/mce.png" :download-path="null"/>
      <DedServerRow name="SkyFactory 4" reason-of-death="died of boredom" image-path="/img/sf4.png" download-path="https://s3.eu-central-1.wasabisys.com/penguins-maps/maps/sf4.zip" />
      <DedServerRow name="Enigmatica 2: Expert - E2E" reason-of-death="died of a nasty adderall & caffeine overdose" image-path="/img/e2e.png" download-path="https://s3.eu-central-1.wasabisys.com/penguins-maps/maps/e2e.zip" />
      <DedServerRow name="The 1.12.2 Pack" reason-of-death="sharted itself" image-path="/img/1122.png" download-path="https://s3.eu-central-1.wasabisys.com/penguins-maps/maps/1122.zip" />
    </div>
  </div>
</template>