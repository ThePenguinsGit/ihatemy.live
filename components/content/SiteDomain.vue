<template>
  <code v-if="code">{{ domain }}</code>
  <template v-else>{{ domain }}</template>
</template>

<script setup lang="ts">
import { SITE_DOMAIN, subdomain } from '~/utils/site';

const props = defineProps<{ sub?: string, code?: boolean }>();

const domain = computed(() => (props.sub
  ? subdomain(props.sub).replace('https://', '')
  : SITE_DOMAIN));
</script>
