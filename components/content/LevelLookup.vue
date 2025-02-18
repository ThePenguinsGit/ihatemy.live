<template>
  <div>
    <input type="text" v-model="username" placeholder="Username"> <button @click="loadData">GO!</button>
  </div>
</template>

<script lang="ts" setup>
import type PlayTimeResultInterface from '~/interfaces/PlayTimeResultInterface';


const username = ref<string>('');
let data = ref<PlayTimeResultInterface|null>(null)
const loadData = async () => {
  //data.value = (await useFetch<PlayTimeResultInterface>(`/api/playtime?username=${username.value}`)).data
  console.log(data)
}
</script>

<style>

</style>