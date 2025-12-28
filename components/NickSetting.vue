<template>
  <Card class="flex flex-col gap-5 justify-between p-0!">
    <div class="w-full flex flex-col gap-2 grow">
      <div class="text-wrap text-xl overflow-hidden break-all w-full p-2 bg-bottom text-white grow flex flex-col justify-end font-[minecraft]" :class="`bg-nick1`" v-html="data" ></div>
      <div class="relative px-2 py-2">
<!--        <textarea v-model="input" class="w-full resize-none border border-black" rows="4"/>-->
        <MiniMessageEditor v-model="input" class="w-full mb-2" @input="inputChanged" />
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
import appConfig from "~/app.config";

const props = defineProps<{
  uuid: Ref<string>,
}>();

const { data: nickData } = await useFetch<MiniMessageNickResponseInterface>('/api/nick', {
  headers: {
    Authorization: useUserStore().token
  },
  query: {
    uuid: props.uuid
  },
  cache: false,
  watch: [props.uuid]
});

const input = ref<string>(nickData.value?.miniMessage ?? '');

const inputChanged = (input) => console.log(input);

watch(nickData, (newValue, oldValue) => {
  if (newValue?.uuid === oldValue?.uuid || (newValue ?? null) === null) {
    return
  }
  input.value = newValue.miniMessage
});

let interval: ReturnType<typeof setInterval>

onNuxtReady(() => {
  interval = setInterval(
      obfuscateAll,
      10
  )
})

onBeforeUnmount(() => {
  window.clearInterval(interval)
})

const obfuscateAll = () => {
  for (let element of document.getElementsByClassName("obfuscated")) {
    obfuscate(element)
  }
}

const obfuscateText = (input: string): string => {
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  return input.split('').map((input) => input === ' ' ? input : allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))).join('')
}

const obfuscate = (input: Node) => {
  if (input.nodeType === Node.ELEMENT_NODE && input.classList.contains('hover')) return
  const childNodes = input.childNodes
  if (childNodes.length > 0) {
    for(const child of childNodes) {
      obfuscate(child)
    }
  }
  if (input.nodeType == Node.TEXT_NODE) {
    input.nodeValue = obfuscateText(input.nodeValue ?? '')
  }
}


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