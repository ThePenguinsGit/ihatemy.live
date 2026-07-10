<template>
  <Card variant="panel" class="flex flex-col h-full font-[minecraft]">
    <div class="flex items-center justify-between gap-2 pb-2 mb-2 border-b-2 border-ink/10">
      <h2 class=" uppercase text-xl">Customize your nickname</h2>
    </div>

    <div class="w-full flex flex-col gap-2 grow">
      <NickEditor v-model="input" class="w-full mb-2" />
      <PixelButton primary @click="saveNick">Save nick</PixelButton>
    </div>
  </Card>
</template>

<script setup lang="ts">
import type MiniMessageNickResponseInterface from "~/interfaces/MiniMessageNickResponseInterface";

const props = defineProps<{
  uuid: string,
}>();

const { data: nickData } = await useFetch<MiniMessageNickResponseInterface>('/api/nick', {
  query: {
    uuid: computed(() => props.uuid)
  },
  cache: false,
});

// `input` is the MiniMessage string (serialized by NickEditor) — the value we save.
const input = ref<string>(nickData.value?.miniMessage ?? '');

watch(nickData, (newValue, oldValue) => {
  if (newValue?.uuid === oldValue?.uuid || (newValue ?? null) === null) {
    return
  }
  input.value = newValue?.miniMessage ?? ''
});


// Scramble animation for the server preview's <obfuscated> spans (class "obfuscated").
// The editor uses its own ".nick-obf" class so its source text is never scrambled.
let interval: ReturnType<typeof setInterval>
onNuxtReady(() => {
  interval = setInterval(obfuscateAll, 10)
})
onBeforeUnmount(() => {
  window.clearInterval(interval)
})

const obfuscateAll = () => {
  for (const element of document.getElementsByClassName("obfuscated")) {
    obfuscate(element)
  }
}

const obfuscateText = (value: string): string => {
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return value.split('').map((c) => c === ' ' ? c : allowedChars.charAt(Math.floor(Math.random() * allowedChars.length))).join('')
}

const obfuscate = (node: Node) => {
  if (node.nodeType === Node.ELEMENT_NODE && (node as Element).classList.contains('hover')) return
  for (const child of node.childNodes) {
    obfuscate(child)
  }
  if (node.nodeType === Node.TEXT_NODE) {
    node.nodeValue = obfuscateText(node.nodeValue ?? '')
  }
}

const saveNick = async () => {
  await $fetch('/api/user/nick/set', {
    method: 'post',
    body: input.value
  })
}
</script>
