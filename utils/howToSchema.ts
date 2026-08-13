import { childrenOf, findNodes, rootNodes, tagOf, textOf } from '~/utils/contentAst';

/**
 * Steps for a HowTo JSON-LD block.
 *
 * A page opts in with a `howto:` key in its frontmatter. Where the procedure is
 * already written as a numbered list — `/docs/getting-started/linking` — the
 * steps are read straight out of that list, so editing the page updates the
 * markup and the two can't drift apart. Pages that explain a procedure in prose
 * instead list their steps in frontmatter (`howto.steps`), summarising what the
 * page already says rather than adding instructions that aren't on it.
 */

export interface HowToConfig {
  name?: string;
  steps?: string[];
}

/** Text of each `li` in the page's first ordered list. */
export function extractOrderedSteps(body: unknown): string[] {
  const [list] = findNodes(rootNodes(body), ['ol'])
  if (!list) return []

  return childrenOf(list)
    .filter(node => tagOf(node) === 'li')
    .map(node => textOf(node).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

/**
 * Build the HowTo node, or null when there's nothing worth publishing.
 * Google wants at least two steps before it treats a procedure as a procedure.
 */
export function buildHowTo(config: HowToConfig | undefined, body: unknown, fallbackName: string) {
  if (!config) return null

  const steps = (config.steps?.length ? config.steps : extractOrderedSteps(body))
    // Frontmatter steps are written as markdown; JSON-LD wants plain text, so a
    // literal `/spark tps` shouldn't reach the schema wearing its backticks.
    .map(step => step.replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  if (steps.length < 2) return null

  return {
    '@type': 'HowTo',
    name: config.name || fallbackName,
    step: steps.map((text, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text,
    })),
  }
}
