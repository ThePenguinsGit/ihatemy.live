<template>
  <Card class="flex flex-col gap-5 justify-between !p-0">
    <div class="w-full flex flex-col gap-2 flex-grow">
      <div class="text-wrap text-xl overflow-hidden break-all w-full p-2 bg-bottom text-white flex-grow flex flex-col justify-end" :class="`bg-nick1`" v-html="data" ></div>
      <div class="relative px-2 py-2">
        <textarea v-model="input" class="w-full resize-none border border-black" rows="4"/>
        <button @click="saveNick" class="bg-blue-500 text-white px-4 py-2 rounded">Save</button>
        <div v-if="!useUserStore().isLoggedIn" class="flex h-full bg-opacity-50 absolute bg-black top-0 place-items-center left-0 right-0 ">
          <Login class="block mx-auto" />
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import {useUserStore} from "~/stores/userStore";
import type MiniMessageNickResponseInterface from "~/interfaces/MiniMessageNickResponseInterface";

const props = defineProps<{
  uuid: string
}>();

const { data: nickData } = await useFetch<MiniMessageNickResponseInterface>('/api/nick', {
  headers: {
    Authorization: useUserStore().token
  },
  query: {
    uuid: props.uuid
  },
  cache: false,
  watch: [props]
});
watch(nickData, (newValue, oldValue) => {
  if (newValue?.uuid === oldValue?.uuid || newValue === null) {
    return
  }
  input.value = newValue.miniMessage
});

const input = ref<string>(nickData.value?.miniMessage ?? '');

const { data } = await useFetch<string>('/api/mini-message/preview', {
  headers: {
    Authorization: useUserStore().token
  },
  query: {
    uuid: props.uuid,
    input: input
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