# The Penguin Network Landing Page
The deployed version of this site can be found at [https://ihatemy.live](https://ihatemy.live)

## What is this for
It shows an overview of current and past Minecraft servers while also giving the ability to download their maps.

## Setup

Make sure to install the dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

### Deploying (Cloudflare Pages)

`npm run build` restores the git history first (Cloudflare clones at depth 1,
which would otherwise give every docs page the same sitemap `lastmod`) and ends
by diffing the freshly built sitemap against the one currently live, writing the
changed URLs to `.output/indexnow.json`.

Those URLs are then announced to IndexNow (Bing, Yandex, Seznam, Naver, Yep —
not Google). Pages has no deploy command, so the submit runs at the end of the
**build command** instead:

```bash
npm run build && npm run indexnow:submit
```

Set it under Workers & Pages → the project → Settings → Builds & deployments →
Build configurations. The announcement therefore leads go-live by about a
minute, which is well inside normal IndexNow crawl latency.

On Workers Builds (which does have a deploy step) keep the build command as
`npm run build` and use `npx wrangler deploy && npm run indexnow:submit` as the
deploy command, so the ping strictly follows go-live.

The submit step is a no-op on preview branches (`CF_PAGES_BRANCH` /
`WORKERS_CI_BRANCH` ≠ `master`) and whenever the diff is empty or could not be
computed. The verification key is public by design and lives in
`public/<key>.txt` — renaming one without the other breaks it.
