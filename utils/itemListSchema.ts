import { findNodes, rootNodes, textOf } from '~/utils/contentAst';


export interface ItemListConfig {
  name?: string;
  startsWith?: string;
}

export function buildItemList(config: ItemListConfig | undefined, body: unknown, fallbackName: string) {
  if (!config) return null

  const headings = findNodes(rootNodes(body), ['h2'])
    .map(node => textOf(node).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .filter(text => !config.startsWith || text.startsWith(config.startsWith))

  if (headings.length < 2) return null

  return {
    '@type': 'ItemList',
    name: config.name || fallbackName,
    numberOfItems: headings.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: headings.map((name, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
    })),
  }
}
