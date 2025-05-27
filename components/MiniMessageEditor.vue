<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap flex-row gap-2">
      <UPopover>
        <button class="button">Choose Color</button>

        <template #content class="flex flex-col gap-2">
          <UColorPicker v-model="color" class="p-2" />
          <div class="flex flex-col"><input type="text" v-model="inputColor" maxlength="7" @change="() => color = inputColor" class="self-center block w-16"></div>
        </template>
      </UPopover>
      <button @click="applyColor" class="button">
        <font-awesome-icon :style="chip" :icon="['fas', 'droplet']" />
      </button>
      <button @click="applyBold" class="button">
        <font-awesome-icon :icon="['fas', 'bold']" />
      </button>
      <button @click="applyItalic" class="button">
        <font-awesome-icon :icon="['fas', 'italic']" />
      </button>
      <button @click="applyStrikeThrough" class="button">
        <font-awesome-icon :icon="['fas', 'strikethrough']" />
      </button>
      <button @click="applyUnderline" class="button">
        <font-awesome-icon :icon="['fas', 'underline']" />
      </button>
      <button @click="undo" class="button">
        <font-awesome-icon :icon="['fas', 'undo']" />
      </button>
      <button @click="redo" class="button">
        <font-awesome-icon :icon="['fas', 'redo']" />
      </button>
    </div>
    <div
        @input="onInput"
        v-html="modelValue"
        contenteditable="true"
        class="wysiwyg-output outline-none border px-2 rounded-sm max-h-24 overflow-y-auto font-[minecraft]"
    />
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.button {
  @apply border border-gray-300 px-2 rounded-sm;
}
.button:hover {
  @apply border-green-300;
}
</style>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>();

const color = ref('#00C16A')
const inputColor = ref(color.value)
watch(color, (newColor) => {
  inputColor.value = newColor
})
const chip = computed(() => ({ color: color.value }))

const emit = defineEmits(['input'])

const onInput = (event) => {
  emit('input', event.target.innerHTML)
}

const applyColor = () => {
  document.execCommand('foreColor', true, color.value)
}

const applyBold = () => {
  document.execCommand('bold')
}
const applyItalic = () => {
  document.execCommand('italic')
}
const applyStrikeThrough = () => {
  document.execCommand('strikeThrough')
}
const applyUnderline = () => {
  document.execCommand('underline')
}
const undo = () => {
  document.execCommand('undo')
}
const redo = () => {
  document.execCommand('redo')
}
</script>