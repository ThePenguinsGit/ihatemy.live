<template>
  <Card class="flex flex-col gap-5 justify-between">
    <div class="w-full">
      <textarea v-model="input" class="w-full resize-none border border-black" rows="4"/>
      <div class="text-wrap text-xl overflow-hidden break-all w-full p-2 bg-bottom text-white" :class="`bg-nick1`" v-html="data" ></div>
    </div>
    <div class="self-end">
      <button @click="saveNick" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">Save</button>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {useUserStore} from "~/stores/userStore";
import type MiniMessageNickResponseInterface from "~/interfaces/MiniMessageNickResponseInterface";

const { data: nickData } = await useFetch<MiniMessageNickResponseInterface>('/api/user/nick', {
  headers: {
    Authorization: useUserStore().token
  },
  cache: false
});

const input = ref<string>(nickData.value.miniMessage);

const { data } = await useFetch<string>('/api/mini-message/preview', {
  headers: {
    Authorization: useUserStore().token
  },
  query: {
    input
  },
  cache: false
});

const saveNick = async () => {
  await useFetch('/api/user/nick/set', {
    headers: {
      Authorization: useUserStore().token
    },
    method: 'post',
    body: input
  })
}
</script>

<style scoped>

</style>