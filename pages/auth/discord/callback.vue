<template>
  <div v-if="useUserStore().isLoggedIn" class="flex flex-col gap-5">
    <Card>
      <h1>Success</h1>
      <p>You logged in as <code>{{useUserStore().name}}</code></p>
      <p>Now you can close this tab and go back to the main page</p>
    </Card>
  </div>
  <div v-else>
    <Card>
    <h1>Failed to login</h1>
    <sub>Something went wrong, sorry 👉👈</sub>
    </Card>
  </div>
</template>

<script setup lang="ts">
const requestUrl = useRequestURL();

const urlSearchParams = new URLSearchParams(requestUrl.hash.slice(1))
const token = urlSearchParams.get('access_token');
const authToken = (await useFetch<string>(
    '/api/auth/discord', {
      query: {
        token: token
      }
    }
)).data.value;
if (authToken) {
  useUserStore().setToken(authToken);
}
</script>