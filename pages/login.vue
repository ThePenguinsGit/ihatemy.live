<template>
  <div class="max-w-md mx-auto w-full flex flex-col gap-6 py-8">
    <SectionHeading title="Sign in" />

    <Card variant="panel" class="flex flex-col gap-4">
      <p class="text-sm">Choose how you'd like to sign in to The Penguin Network.</p>

      <LoginDiscordButton />

      <LoginXboxButton />

      <p v-if="errorMessage" class="text-ded text-sm" role="alert">{{ errorMessage }}</p>
    </Card>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Sign in · The Penguin Network' });

const { loggedIn } = useUserSession();
// Already signed in → nothing to do here.
watchEffect(() => {
  if (loggedIn.value) navigateTo('/');
});

const route = useRoute();
const errorMessage = computed(() => {
  switch (route.query.error) {
    case 'discord': return 'Discord sign-in failed. Please try again.';
    case 'xbox': return 'Xbox sign-in failed. Please try again.';
    case 'xbox_config': return 'Xbox sign-in is not configured yet.';
    case 'minecraft': return 'Could not reach your Minecraft account. Please try again.';
    case 'minecraft_unowned': return 'That Microsoft account does not own Minecraft: Java Edition.';
    default: return route.query.error ? 'Sign-in failed. Please try again.' : '';
  }
});
</script>
