import { SITE_DOMAIN, SITE_NAME, serverHostname, subdomain } from '~/utils/site';

/**
 * Small helpers for reading a parsed @nuxt/content page body.
 *
 * Nodes arrive in MDC's "minimal" form — `['tag', props, ...children]` — but the
 * object form shows up too depending on the transformer, so everything here
 * accepts both. Used by the structured-data builders (see [[faqSchema]] and
 * [[howToSchema]]) so their markup is always derived from what the page renders.
 */

export type MdcNode = string | unknown[] | {
  tag?: string;
  type?: string;
  value?: string;
  children?: MdcNode[];
};

export function tagOf(node: MdcNode): string | undefined {
  if (Array.isArray(node)) return typeof node[0] === 'string' ? node[0] : undefined
  if (node && typeof node === 'object') return node.tag
  return undefined
}

export function childrenOf(node: MdcNode): MdcNode[] {
  if (Array.isArray(node)) return node.slice(2) as MdcNode[]
  if (node && typeof node === 'object' && Array.isArray(node.children)) return node.children
  return []
}

/** Props of a component node, in either the array or object form. */
export function propsOf(node: MdcNode): Record<string, unknown> {
  if (Array.isArray(node)) return (node[1] as Record<string, unknown>) ?? {}
  if (node && typeof node === 'object') return ((node as { props?: Record<string, unknown> }).props) ?? {}
  return {}
}

/**
 * Text a site component renders, so extracted text matches the rendered page.
 * Without this, `:server-host` inside an answer would vanish from the FAQ
 * markup while staying visible to the reader — exactly the mismatch that makes
 * structured data untrustworthy.
 */
function componentText(tag: string, props: Record<string, unknown>): string | undefined {
  const shortName = (props.shortName ?? props['short-name']) as string | undefined

  switch (tag) {
    case 'site-name': return SITE_NAME
    case 'site-domain': return props.sub ? subdomain(String(props.sub)).replace('https://', '') : SITE_DOMAIN
    case 'server-host': return shortName ? serverHostname(shortName) : undefined
    default: return undefined
  }
}

/** Flatten a node's text, collapsing whitespace the way a reader would see it. */
export function textOf(node: MdcNode): string {
  if (typeof node === 'string') return node
  if (node && typeof node === 'object' && !Array.isArray(node) && typeof node.value === 'string') return node.value

  const tag = tagOf(node)
  if (tag) {
    const rendered = componentText(tag, propsOf(node))
    if (rendered !== undefined) return rendered
  }

  return childrenOf(node).map(textOf).join('')
}

/** The `value` array of a page body, or [] when the body isn't parsed content. */
export function rootNodes(body: unknown): MdcNode[] {
  const root = (body as { value?: MdcNode[] })?.value
  return Array.isArray(root) ? root : []
}

/** Depth-first walk yielding every node whose tag matches `tags`. */
export function findNodes(nodes: MdcNode[], tags: string[], out: MdcNode[] = []): MdcNode[] {
  for (const node of nodes) {
    const tag = tagOf(node)
    if (tag && tags.includes(tag)) {
      out.push(node)
      continue
    }
    findNodes(childrenOf(node), tags, out)
  }
  return out
}
