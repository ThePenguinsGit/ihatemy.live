// Node --test resolve hook: map the project's `~/` alias to the repo root and
// add a `.ts` extension when the specifier has none, so unit tests can import
// with the same `~/...` style the app uses.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = new URL('../', import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('~/')) {
    let url = new URL(specifier.slice(2), ROOT);
    if (!/\.\w+$/.test(url.pathname)) {
      const withTs = new URL(`${url.href}.ts`);
      if (existsSync(fileURLToPath(withTs))) url = withTs;
    }
    return nextResolve(url.href, context);
  }
  return nextResolve(specifier, context);
}
