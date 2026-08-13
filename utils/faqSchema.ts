import { type MdcNode, childrenOf, rootNodes, tagOf, textOf } from '~/utils/contentAst';

/**
 * Pull question/answer pairs out of a parsed @nuxt/content page body so they can
 * be emitted as FAQPage JSON-LD.
 *
 * Every `h2` starts a question; everything after it — across `::card` / `::row`
 * container boundaries — is its answer, until the next `h2`. The pairs are read
 * from the same AST the page renders, so the markup can never claim an answer
 * the visitor doesn't see (which is what makes FAQ markup a manual-action risk).
 */

export interface FaqPair {
  question: string;
  answer: string;
}

/**
 * Answers shorter than this are jokes or placeholders ("??"), not answers.
 * Publishing them as Question/Answer nodes would be markup that doesn't earn
 * its rich result, so they stay visible on the page but out of the schema.
 */
const MIN_ANSWER_LENGTH = 15;

/** Depth-first walk that keeps only what carries text: headings and leaf blocks. */
function flatten(nodes: MdcNode[], out: MdcNode[] = []): MdcNode[] {
  for (const node of nodes) {
    const tag = tagOf(node)
    if (tag && /^h[1-6]$/.test(tag)) {
      out.push(node)
      continue
    }
    if (tag && ['p', 'li', 'blockquote'].includes(tag)) {
      out.push(node)
      continue
    }
    const kids = childrenOf(node)
    if (kids.length) flatten(kids, out)
    else if (typeof node === 'string' && node.trim()) out.push(node)
  }
  return out
}

export function extractFaqPairs(body: unknown): FaqPair[] {
  const pairs: FaqPair[] = []
  let current: FaqPair | null = null

  for (const node of flatten(rootNodes(body))) {
    const tag = tagOf(node)
    const text = textOf(node).replace(/\s+/g, ' ').trim()
    if (!text) continue

    if (tag === 'h2') {
      if (current && current.answer.length >= MIN_ANSWER_LENGTH) pairs.push(current)
      current = { question: text, answer: '' }
    } else if (current) {
      current.answer = current.answer ? `${current.answer} ${text}` : text
    }
  }
  if (current && current.answer.length >= MIN_ANSWER_LENGTH) pairs.push(current)

  return pairs
}
