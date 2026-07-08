<template>
  <div class="max-w-md mx-auto w-full flex flex-col gap-6 py-8">
    <SectionHeading title="Sign in" />

    <Card variant="panel" class="flex flex-col gap-4">
      <p class="text-sm">Choose how you'd like to sign in to The Penguin Network.</p>

      <ProviderButton href="/auth/discord" label="Continue with Discord" brand="#5865F2">
        <template #icon>
          <svg viewBox="0 -28.5 256 256" fill="currentColor" aria-hidden="true">
            <path d="M216.856 16.597A209.5 209.5 0 0 0 164.042 0c-2.276 4.113-4.933 9.646-6.766 14.046-19.692-2.961-39.203-2.961-58.533 0C96.911 9.646 94.193 4.113 91.897 0A208.5 208.5 0 0 0 39.042 16.638C5.618 67.146-3.443 116.401 1.087 164.956c22.169 16.555 43.653 26.612 64.775 33.193a161 161 0 0 0 13.873-22.848 135 135 0 0 1-21.846-10.632 109 109 0 0 0 5.356-4.235c42.122 19.702 87.89 19.702 129.51 0a95 95 0 0 0 5.356 4.235 135 135 0 0 1-21.887 10.653 161 161 0 0 0 13.873 22.848c21.142-6.581 42.646-16.638 64.815-33.213 5.316-56.288-9.081-105.09-38.056-148.36ZM85.474 135.095c-12.645 0-23.015-11.805-23.015-26.18s10.149-26.2 23.015-26.2c12.867 0 23.236 11.804 23.015 26.2 0 14.375-10.148 26.18-23.015 26.18Zm85.051 0c-12.645 0-23.015-11.805-23.015-26.18s10.148-26.2 23.015-26.2c12.866 0 23.236 11.804 23.014 26.2 0 14.375-10.148 26.18-23.014 26.18Z"/>
          </svg>
        </template>
      </ProviderButton>

      <ProviderButton
        href="/auth/xbox"
        label="Continue with Xbox"
        sublabel="Also links your Minecraft account"
        brand="#107C10"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4.102 21.033A11.947 11.947 0 0 0 12 24a11.96 11.96 0 0 0 7.902-2.967c1.877-1.912-4.316-8.708-7.902-11.417-3.582 2.71-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912A11.949 11.949 0 0 0 24 12.004a11.94 11.94 0 0 0-3.57-8.536s-.027-.022-.082-.042c-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.041A11.94 11.94 0 0 0 0 12.004c0 2.508.771 4.836 2.084 6.762C.676 16.167 5.66 8.815 8.16 5.854 5.342 3.045 3.95 2.61 3.357 2.61c-.129 0-.216.017-.27.043zM12 3.09C10.31 1.482 5.924.001 5.924.001 12 0 12 0 12 0s6.076.001 6.076.001S13.69 1.482 12 3.09z"/>
          </svg>
        </template>
      </ProviderButton>

      <p v-if="errorMessage" class="text-ded text-sm" role="alert">{{ errorMessage }}</p>
    </Card>
  </div>
</template>

<script setup lang="ts">
// Custom login page: pick an identity provider. Both links hit server OAuth
// routes (/auth/discord, /auth/xbox) that complete via nuxt-auth-utils.
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
