<template>
  <div>
    <Card class="w-full ">
      <div>
        <h2>Check your progress</h2>
        <input type="text" autocomplete="off" class="w-full px-2 my-1 bg-gray-300 rounded-sm placeholder:text-gray-700 placeholder:italic border-black border border-solid" :spellcheck="false" v-model="username" placeholder="Username">
        <hr class="pb-2 mt-1" v-if="username.length > 0">
        <LevelLookupDetails v-if="data " :data="data" />
        <div v-if="error && error.statusCode === 404 && username.length > 0">
          <div class="text-center">
            <p>I have never seen that user in my LIFE</p>
            <p>Try another username</p>
            <p>👁👄👁</p>
            <p>(╯°□°)╯︵ ┻━┻</p>
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>

<script lang="ts" setup>
import appConfig from "~/app.config";
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';
import type PenguBotResponseInterface from "~/interfaces/PenguBotResponseInterface";
import LevelLookupDetails from "~/components/LevelLookupDetails.vue";

const route = useRoute();
const reactiveQuery = computed(() => route.query.name);
const username = ref<string>(useRoute().query.name as string ?? '');
watch(reactiveQuery, () => username.value = reactiveQuery.value as string ?? '');

const { data, error, refresh } = await useFetch<PenguBotResponseInterface<PlayTimeResultInterface>|null>('/api/playtime', {
  immediate: true,
  query: {  name: username }
})

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(() => {
    if (username.value.length > 0) refresh()
  }, appConfig.secondsToRefreshLeaderBoard * 1000)
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})
</script>

<style>

</style>