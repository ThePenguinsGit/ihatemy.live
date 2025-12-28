<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap flex-row gap-2">
      <div v-if="editor">
        <button
            @click="editor.chain().focus().toggleBold().run()"
            :disabled="!editor.can().chain().focus().toggleBold().run()"
            :class="{ 'is-active': editor.isActive('bold') }"
        >
          bold
        </button>
        <input
            type="color"
            @input="event => editor.chain().focus().setColor(event.target.value).run()"
            :value="editor.getAttributes('textStyle').color"
            :class="{ 'is-active': editor.isActive('textStyle', { color }) }"
        >
          color
        <button
            @click="editor.chain().focus().toggleItalic().run()"
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': editor.isActive('italic') }"
        >
          italic
        </button>
        <button
            @click="editor.chain().focus().toggleStrike().run()"
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': editor.isActive('strike') }"
        >
          strike
        </button>
        <button @click="editor.chain().focus().unsetAllMarks().run()">
          reset formatting
        </button>
        <button
            @click="editor.chain().focus().undo().run()"
            :disabled="!editor.can().chain().focus().undo().run()"
        >
          undo
        </button>
        <button
            @click="editor.chain().focus().redo().run()"
            :disabled="!editor.can().chain().focus().redo().run()"
        >
          redo
        </button>
      </div>
      <TiptapEditorContent :editor="editor" />
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

button {
  @apply border border-gray-300 px-2 rounded-sm;
}
button:hover {
  @apply border-green-300;
}
</style>

<script setup lang="ts">
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'

const props = defineProps<{
  modelValue: string
}>();

const editor = useEditor({
  content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
  extensions: [TiptapStarterKit, TextStyle, Color],
});

onBeforeUnmount(() => {
  unref(editor).destroy();
});


const nick = ref<string>(props.modelValue)

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