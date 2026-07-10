import type { ContentNavigationItem } from '@nuxt/content';

export interface DocsNavLeaf {
  title: string;
  path: string;
}

/** A single breadcrumb entry; `to` omitted renders as plain (current/section) text. */
export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Flatten the `queryCollectionNavigation('docs')` tree into an ordered list of
 * navigable pages (depth-first, honouring the `position` ordering already applied
 * by the query). Section labels (`page === false`) are skipped, and the child that
 * duplicates a folder's own index page (same `stem`) is dropped — mirroring the
 * guard in `NavigationEntry.vue`. Used to drive prev/next paging and breadcrumbs.
 */
export function flattenNavigation(
  items: ContentNavigationItem[] | undefined | null,
): DocsNavLeaf[] {
  const out: DocsNavLeaf[] = [];

  const walk = (nodes: ContentNavigationItem[]) => {
    for (const node of nodes) {
      if (node.page !== false && typeof node.path === 'string') {
        out.push({ title: node.title, path: node.path });
      }
      if (node.children?.length) {
        walk(node.children.filter((child) => child.stem !== node.stem));
      }
    }
  };

  walk(items ?? []);
  return out;
}
