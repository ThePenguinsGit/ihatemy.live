<template>
  <form class="flex flex-col gap-1.5" @submit.prevent="submit">
    <label :for="id" class="font-[minecraft] text-sm">{{ label }}</label>
    <div class="flex gap-2">
      <input
        :id="id"
        v-model="name"
        type="text"
        autocomplete="off"
        :spellcheck="false"
        maxlength="16"
        class="pixel-input min-w-0 flex-1"
        :placeholder="placeholder"
        :list="suggestions?.length ? `${id}-list` : undefined"
        :aria-describedby="note || done ? `${id}-note` : undefined"
        @input="note = null; done = null"
      >
      <datalist v-if="suggestions?.length" :id="`${id}-list`">
        <option v-for="s in suggestions" :key="s" :value="s" />
      </datalist>
      <PixelButton type="submit" primary class="!py-1 shrink-0 text-sm" :disabled="busy || !name.trim()">
        {{ busy ? busyLabel : submitLabel }}
      </PixelButton>
    </div>
    <div :id="`${id}-note`" aria-live="polite">
      <SocialFallbackNote v-if="note?.fallback" :command="note.fallback" />
      <p v-else-if="note?.error" role="alert" class="text-sm text-ded">{{ note.error }}</p>
      <p v-else-if="done" class="text-sm">{{ done }}</p>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { SocialActionName } from '~/utils/socialActions';

// A name box that runs one friend/party action on whatever player is typed,
// e.g. sending a friend request or a party invite.
const props = defineProps<{
  action: SocialActionName,
  label: string,
  placeholder: string,
  submitLabel: string,
  busyLabel: string,
  // What to say once it worked; gets the name as typed.
  successText: (name: string) => string,
  suggestions?: string[],
}>();

const id = useId();
const { run } = useSocialActions();

const name = ref('');
const busy = ref(false);
const note = ref<{ fallback?: string, error?: string } | null>(null);
const done = ref<string | null>(null);

const submit = async () => {
  const typed = name.value.trim();
  if (!typed || busy.value) return;
  busy.value = true;
  note.value = null;
  done.value = null;
  const result = await run(props.action, { kind: 'name', name: typed });
  busy.value = false;
  if (result.ok) {
    done.value = props.successText(typed);
    name.value = '';
    return;
  }
  note.value = 'fallback' in result ? { fallback: result.fallback } : { error: result.error };
};
</script>
