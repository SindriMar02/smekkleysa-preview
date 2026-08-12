import { mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { render } from './template.mjs';
import { MARK_S_PATH, LOCKUP_TRANSFORM } from './brand.mjs';

/* A spec redesign published under a real business's brand sits on a URL that is not
   theirs. Without noindex + a canonical pointing at the preview itself, a full-fidelity
   mockup can be indexed as duplicate content and damage the prospect's own search
   presence, which is the opposite of the pitch. */
const PREVIEW_ORIGIN = process.env.PREVIEW_ORIGIN || '';
const isPreview = Boolean(PREVIEW_ORIGIN);

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(root, 'public'), dist, { recursive: true });

/* Their own colours: the pink of the pig, the black of the line, and the stencil break
   that runs through every letter of their logotype. A RELATIVE href, so the client's
   tab can never inherit another origin's icon (redesign-craft-ledger: a preview once
   showed ARTIX's helm in a client's tab). */
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" fill="#0B0809"/>
<rect x="5" y="5" width="54" height="54" fill="#E583AA"/>
<g transform="translate(13.682,8.494) scale(0.21176)"><g transform="${LOCKUP_TRANSFORM}"><path fill="#0B0809" d="${MARK_S_PATH}"/></g></g>
</svg>`;
await writeFile(join(dist, 'favicon.svg'), favicon);

await writeFile(join(dist, 'index.html'), render({ noindex: isPreview, previewOrigin: PREVIEW_ORIGIN }));
if (isPreview) await writeFile(join(dist, '.nojekyll'), '');

await writeFile(
  join(dist, 'robots.txt'),
  isPreview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n'
);

console.log(`built dist/index.html${isPreview ? ` [preview: noindex, ${PREVIEW_ORIGIN}]` : ''}`);
