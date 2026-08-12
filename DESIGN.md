# Smekkleysa SM — frumgerð (SNDR Studio)

A spec redesign of `smekkleysa.net`. Vanilla JS, **zero dependencies**, one damped rAF
engine. Engine transplanted from the Alda Music → 12 Tónar build; the hero, the palette
and the display face are this build's own.

Preview runs on `node server.mjs` → `http://localhost:8812`.
Pipeline: `python3 tools/harvest.py && python3 tools/fetch.py && python3 tools/assets.py && node src/build.mjs`

---

## 1. The idea

**Their logotype is a stencil, so the wordmark is literally a window; and what shows
through it is a photocopy.**

Both halves come from them, not from a mood board:

- The wordmark they serve on their own site is a heavy condensed **stencil**, breaks and
  all. A stencil is already a hole in a plate, which is the exact thing this engine's
  hero wants to be. It is traced in `src/brand.mjs` (potrace, native 1024x210,
  `--turdsize 3 --alphamax 1.0 --opttolerance 0.6`, ten subpaths, one per letter of
  S M E K K L E Y S A, read back by eye before use).
- Their own history page traces Bad Taste's roots to the **photocopy poets** and the copy
  centre **Letur**, where books were run off cheaply and sold in the cafés of Reykjavík.
  So the field inside the letters is a sheet on that machine: horizontal bands that creep
  sideways as the sheet feeds, with a light bar travelling down it.

This is the part that had to be *different* rather than recoloured. Alda's letters look
onto a film of the sea; 12 Tónar's onto a mosaic of rectangles in two flat colours. A
mosaic in pink and yellow would have been the same device in new paint.

## 2. Tokens

| | |
|---|---|
| pink | `#E583AA` — **sampled from their own logo file**, where the pig holds 49.1% of the mark's opaque pixels |
| yellow | `#F4EA38` — the trumpet in the same file |
| ink | `#0B0809` / `#151013` — their line is drawn in flat black |
| paper | `#EFEAE4` / `#E2DBD2` |
| accent on paper | `#8C2A50` (pink is 2.13:1 on paper and unusable) |
| chalk | `#F6F4F1` |
| display | **Bespoke Stencil** Extrabold/Medium (ITF, free licence, from `~/Design fonts/`) |
| body | Archivo 400/500/700 |
| mono | Departure Mono |

Every hex was read out of an asset they drew. The 12 Tónar build shipped "brand blues"
that turned out to be Shopify Dawn's stock `colour-scheme-5` defaults, so the colours here
were sampled with a pixel histogram rather than picked off the live CSS.

**The pink band takes INK type, not chalk.** Ink on this pink is 7.70:1; chalk would be
2.3:1. Their mark is a pink pig drawn in black line, so this is also the truer reading.

## 3. Motion

Transplanted, unchanged unless noted. Everything scroll-linked moves at **exactly 1.00x**
and damping is on the wheel only, never the finger.

| device | driver | numbers |
|---|---|---|
| hero wordmark parting | scroll-linked, canvas, **every frame** | `hx * size * 0.5`; per-frame since a half-rate recomposite visibly hops against a native scroll |
| copier bar | time-based | 5200ms top to bottom, one gradient rect, absent under reduced motion |
| band creep | time-based | 4 to 30 px/s per band, own direction, wrapped at `w * 1.6` |
| band colour swap | time-based | hard swap, never a crossfade; 1400 to 6000ms per band, own clock |
| opening reveal | time-based | line 1 `0.14→0.62`, line 2 `0.24→0.74`, each from its own baseline upward |
| the roll | **CSS scroll-driven** `view-timeline` where supported, JS damped channel as fallback | settle 1 frame, both form factors |
| section stack | CSS `view()` timelines, ranges as **lengths** not percentages | `--al-enter` / `--al-exit` |
| release rail | native `overflow-x` + snap; pointer drag + inertia on **fine pointers only** | touch is 1.00x by construction, zero JS in the path |
| reveals | own `view()` timeline | `cover 6vh -> 58vh` |

Reduced motion: the copier bar and the band creep are **absent**, not frozen; the page
still scrolls with rAF killed outright (`qa/lock.mjs`).

## 4. Sections

1. hero — stencil wordmark, photocopy field, ticker of what is newly in
2. **Nýkomið** — the draggable rail, 18 real records with real ISK prices and real links
3. **Í rekkunum** — the pinned roll, 60 artists, one sleeve each, scramble-decode on the name
4. **Sagan** — the odometer timeline, five entries from their own history page
5. **Útgáfan sjálf** — the full plane of their pink, ink type, **no artwork** (see FACTS.md)
6. CTA — send us your music / come to the shop
7. footer — hours, address, kennitala, the frumgerð disclaimer

## 5. What this build changed in the engine, and why

Three of these are bugs the two previous builds are still carrying.

- **The hidden-tab deadlock (real bug, live on 12 Tónar).** `runLoader` calls `land()`
  synchronously when the tab starts hidden, but `landed` and `clearFailsafe` were declared
  with `let`/`const` near the bottom of the function, so that call ran in their temporal
  dead zone and threw `ReferenceError`. The throw happens inside a `fonts.load().then()`,
  so it surfaces only as an unhandled rejection, and the page is left with `al-loading` on
  `<body>` — which carries `overflow: hidden`. A tab that starts hidden never got a hero
  and never scrolled. `typeof clearFailsafe === 'function'` did **not** guard it: `typeof`
  on a `let`/`const` in its dead zone throws too. Both bindings are now hoisted.
  `qa/lock.mjs`'s "rAF dead (backgrounded tab)" case is the proof.
- **The display face was never the one the CSS names.** The engine declares
  `font-family: 'Humane'` and preloads `fonts/humane.woff2`, but that file's name table
  says **`ABC Favorit Regular`** — a wide neo-grotesque at 0.686 average advance where
  Humane is about a third of that. Both previous builds have been rendering a face neither
  of them names, and every note about "Humane's 0.7em cap height" was tuned against ABC
  Favorit's. Found by measuring, not by reading the CSS: a span in the declared family came
  back within 1% of Arial. **ABC Favorit is a commercial Dinamo face — worth checking the
  licence on the two live builds.** This build uses Bespoke Stencil instead.
- **`HERO.markLines` was not wired to anything.** The hero's lines were hardcoded in
  `app.js` as `['12', 'TÓNAR']`. The two builds happened to agree, so it never showed.
  A transplant would silently render the previous client's name in the largest type on the
  page. The lines now come from the markup.
- **Inherited asset paths.** The hero markup referenced `img/brand/record-loop.mp4` and
  `record-poster.webp`, and a `prefers-reduced-motion` rule referenced the poster too.
  Neither exists here. The film is gone on purpose: a turning record is not this hero, the
  asset is not theirs, and it was measured on 12 Tónar as the most expensive thing on the
  page (25.2fps with it, 43.0 without). A media query is the worst place to leave an
  inherited path, because it fails only for readers who set the preference.
- **The hand-cut stencil bridges were removed.** An earlier pass knocked bars through the
  glyph alpha with `destination-out` to fake the breaks. Once the display face became a
  real stencil those were cutting a second set of breaks through letters that already had
  their own. The typeface does it properly.
- **Skip-link contrast.** `.al-skip` was `background: var(--red); color: #fff`. With this
  build's pink that is 2.57:1 on the first control a keyboard user reaches. Now ink, 7.75:1.

## 6. Gates

All run against the live preview.

| gate | result |
|---|---|
| `qa/lock.mjs` — page scrolls in a visible tab, with rAF killed, and under reduced motion | **PASS 3/3**, 1500px each |
| `qa/fit.mjs` — text fits at 8 widths | **ALL CLEAN** (390 → 1920) |
| `qa/contrast.mjs` — every text node against its real backdrop, AA thresholds | **PASS**, nothing below AA |
| `qa/touch.mjs` — synthesised touch, not scrollTo | vertical over rail 348px (want ~350) · **diagonal drag leak 0px** · horizontal rail 695px, post-release peak 558px/s · vertical over roll 399px (want ~400) |
| `qa/walk-smk.mjs` — desktop + mobile | 0 page errors, 0 HTTP errors, 1 `<h1>`, no horizontal scroll either form factor |
| `tools/assets.py` | max emitted/source ratio **0.600** |

The 56 images reporting `naturalWidth === 0` are **not broken**: they are `.al-plate`
images whose `src` is stashed in `data-src` by the roll's memory windowing, which is the
fix for the 280MB-of-bitmap problem from the Alda build.

## 7. Not done

- Perf was not profiled on this build. The two most expensive things in the source build
  (the video and its CSS filter) are gone, and the field is bands rather than a mosaic, so
  it should be ahead — but that is reasoning, not a measurement. Run `qa/perf.mjs` and
  `qa/recalc.mjs` before deploying.
- Not deployed. `deploy.sh` points at `sindrimar02.github.io/smekkleysa-preview`.
- `/review-animations` has not been run; that one is Sindri's to type.
- The auction is mentioned in the timeline but does not have its own section, and it is
  the most distinctive thing they do.
