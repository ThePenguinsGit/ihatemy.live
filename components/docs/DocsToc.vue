<template>
  <Card as="aside" variant="panel" class="w-full xl:w-56 xl:sticky top-4 h-fit shrink-0">
    <div class="eyebrow mb-2">On this page</div>
    <ul class="flex flex-col gap-1">
      <li v-for="link in flatLinks" :key="link.id" :style="{ marginLeft: `${(link.depth - minDepth) * 12}px` }">
        <a
          :href="`#${link.id}`"
          class="block text-sm transition-colors hover:text-iceDeep"
          :class="link.depth === minDepth ? 'font-[minecraft] uppercase' : 'text-secondaryLight'"
        >{{ link.text }}</a>
      </li>
    </ul>
  </Card>
</template>

<script setup lang="ts">
// Renders the per-page table of contents from Nuxt Content's `body.toc.links`.
// Nested links are flattened with a depth-based indent.
interface TocLink {
  id: string;
  text: string;
  depth: number;
  children?: TocLink[];
}

const props = defineProps<{ links: TocLink[] }>();

const flatLinks = computed<TocLink[]>(() => {
  const out: TocLink[] = [];
  const walk = (links: TocLink[]) => {
    for (const link of links) {
      out.push(link);
      if (link.children?.length) walk(link.children);
    }
  };
  walk(props.links ?? []);
  return out;
});

const minDepth = computed(() =>
  flatLinks.value.length ? Math.min(...flatLinks.value.map((l) => l.depth)) : 2,
);
</script>
