# Unified Agent Skills Reference

This project has **4 installed skills** located under `.agents/skills/`. Load this file for a
complete picture of all available guidance before starting any UI, design, or React/Next.js task.

> **How to use:** Read the *When to Apply* section of each skill. Activate every skill whose
> trigger conditions match the current task — skills are complementary and stack well together.

---

## Skill Index

| Skill | Domain | Trigger Keywords |
|---|---|---|
| [frontend-design](#1-frontend-design) | Aesthetic / visual identity | new UI, redesign, layout, typography, visual direction |
| [ui-ux-pro-max](#2-ui-ux-pro-max) | Full UI/UX intelligence + search | components, accessibility, color, fonts, animation, charts |
| [vercel-react-best-practices](#3-vercel-react-best-practices) | React / Next.js performance | React components, Next.js pages, data fetching, bundle size |
| [web-design-guidelines](#4-web-design-guidelines) | UI compliance audit | "review my UI", "check accessibility", "audit design", "check best practices" |

---

## 1. `frontend-design`

**SKILL.md:** `.agents/skills/frontend-design/SKILL.md`
**Source:** `anthropics/skills`

### Purpose
Acts as an opinionated design lead for building **distinctive, non-templated UIs**. Rejects
clichéd or AI-generated-looking defaults in favour of deliberate choices specific to the brief.

### When to Apply
- Building or reshaping any UI, page, or component
- Choosing palette, typography, layout, or visual direction
- When output must not look AI-generated or templated

### Two-Pass Process
1. **Plan** — produce a compact token system: 4–6 named hex colours, typeface roles, layout
   concept (prose + ASCII wireframe), and 3–5 design principles specific to this brief.
2. **Critique then build** — check the plan against AI-design tells listed below; revise anything
   that reads as a generic default before writing code.

### AI-Design Tells to Avoid
- Warm cream (`~#F4F1EA`) background + terracotta/clay accent (`~#D97757`)
- Near-black background with a single acid-green or vermilion accent
- Broadsheet layout: hairline rules, zero border-radius, newspaper columns
- SaaS-card kit: identical rounded cards, same soft grey shadow on everything, gradient wash decoration
- Template chrome: tracked-out ALL-CAPS eyebrows, `A · B · C` meta strings, `WORD — fragment` labels,
  tinted near-black (`#0B0B0B`), monospace data labels, `→` appended to every link

### Key Design Principles
- **Hero first:** open with the most characteristic element of the subject's world.
- **Typography carries personality.** Use 1–2 families, set a deliberate scale. Default line length < 80 chars.
- **Visual structure is information.** Numbered markers only when content is truly sequential.
- **Motion: one orchestrated moment.** Avoid fade-and-slide on every section. Action-triggered motion is welcome.
- **Restraint:** spend boldness in one place; keep everything else quiet and disciplined.
- **Copy:** active voice, plain verbs, sentence case. CTAs say exactly what happens ("Save changes", not "Submit").

### CSS Caution
Watch for selector specificity conflicts (e.g. `.section` vs element-based selectors cancelling padding/margin).

---

## 2. `ui-ux-pro-max`

**SKILL.md:** `.agents/skills/ui-ux-pro-max/SKILL.md`
**Source:** `nextlevelbuilder/ui-ux-pro-max-skill`

### Purpose
A **searchable UI/UX design intelligence engine** backed by local data:
79 styles · 192 product palettes · 74 font pairings · 119 UX guidelines · 105 icons ·
17 GSAP presets · 25 chart types · 22 technology stacks.

### When to Apply
Any task involving UI structure, visual design, interaction patterns, accessibility, responsive
layout, typography, color, charts, or stack-specific UI implementation. Skip for pure backend /
infrastructure work — unless it changes how something **looks, feels, moves, or is interacted with**.

### Priority Checklist (apply in order)

| # | Category | Impact | Key Checks | Anti-Patterns |
|---|---|---|---|---|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, alt text, keyboard nav, aria-labels | Removing focus rings, icon-only buttons without labels |
| 2 | Touch & Interaction | CRITICAL | Min 44×44 px, 8px+ spacing, loading feedback | Hover-only reliance, instant 0ms state changes |
| 3 | Performance | HIGH | WebP/AVIF, lazy loading, CLS < 0.1 | Layout thrashing, cumulative layout shift |
| 4 | Style Selection | HIGH | Match product type, SVG icons (no emoji) | Mixing flat & skeuomorphic randomly |
| 5 | Layout & Responsive | HIGH | Mobile-first, viewport meta, no horizontal scroll | Fixed px containers, disabled zoom |
| 6 | Typography & Color | MEDIUM | 16px base, 1.5 line-height, semantic color tokens | Body text < 12px, gray-on-gray, raw hex in components |
| 7 | Animation | MEDIUM | Context-aware timing, motion conveys meaning | Same duration for every transition, no reduced-motion |
| 8 | Forms & Feedback | MEDIUM | Visible labels, error near field, helper text | Placeholder-only label, errors only at top |
| 9 | Navigation | HIGH | Predictable back, bottom nav ≤ 5 items, deep linking | Overloaded nav, broken back behavior |
| 10 | Charts & Data | LOW | Legends, tooltips, accessible colours | Relying on colour alone to convey meaning |

### Search Tool

```bash
# Full path required — do not assume working directory
python "${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <domain>
```

**Common domains:** `product` · `style` · `color` · `typography` · `google-fonts` · `chart` ·
`ux` · `landing` · `icons` · `gsap` · `react` · `web`

**Available stacks:** `react` · `nextjs` · `vue` · `svelte` · `astro` · `nuxtjs` · `nuxt-ui` ·
`angular` · `laravel` · `swiftui` · `react-native` · `flutter` · `html-tailwind` · `shadcn` · `threejs`

### Design System Generation

```bash
# Generate
python "…/search.py" "<product_type> <industry> <keywords>" --design-system -p "Project Name"

# Persist to disk (always pass --output-dir)
python "…/search.py" "<query>" --design-system --persist -p "Project Name" --output-dir "<project-root>"

# Tuning dials (1–10 each)
python "…/search.py" "<query>" --design-system --variance <1-10> --motion <1-10> --density <1-10>
```

- `--variance`: 1–3 minimal/centred → 8–10 bold/asymmetric (Brutalism, Bento Grid)
- `--motion`: 1–3 subtle micro-interactions → 8–10 complex GSAP choreography
- `--density`: 1–3 spacious (24–96 px scale) → 8–10 dense dashboard (8–32 px scale)

Persisted files: `design-system/<project-slug>/MASTER.md` + `pages/<page>.md` overrides.
**Never use `--force` without explicit user authorisation.**

### Retrieval When Building a Page
1. Read `design-system/<project-slug>/MASTER.md`
2. If `pages/<page-name>.md` exists, its rules override Master
3. Otherwise use Master exclusively

### Pre-Delivery Checklist
Before shipping any app UI, read `references/pro-rules.md` inside the skill directory.
Covers icon discipline, interaction feedback, dark-mode contrast, safe-area layout, accessibility.

---

## 3. `vercel-react-best-practices`

**SKILL.md:** `.agents/skills/vercel-react-best-practices/SKILL.md`
**Source:** `vercel-labs/agent-skills` — MIT License

### Purpose
**70 React & Next.js performance rules** from Vercel Engineering, prioritised by impact.
Detailed rule files live in `rules/*.md`; fully compiled doc is in `AGENTS.md` (inside the skill dir).

### When to Apply
- Writing new React components or Next.js pages
- Implementing client- or server-side data fetching
- Reviewing code for performance issues
- Optimising bundle size or load times

### Rules by Priority

#### 1 · Eliminating Waterfalls — CRITICAL (`async-*`)
- `async-cheap-condition-before-await` — Check cheap sync conditions before awaiting flags
- `async-defer-await` — Move await into branches where actually used
- `async-parallel` — Use `Promise.all()` for independent operations
- `async-dependencies` — Use `better-all` for partial dependencies
- `async-api-routes` — Start promises early, await late in API routes
- `async-suspense-boundaries` — Use Suspense to stream content

#### 2 · Bundle Size Optimization — CRITICAL (`bundle-*`)
- `bundle-barrel-imports` — Import directly, avoid barrel files
- `bundle-analyzable-paths` — Prefer statically analysable import paths
- `bundle-dynamic-imports` — Use `next/dynamic` for heavy components
- `bundle-defer-third-party` — Load analytics/logging after hydration
- `bundle-conditional` — Load modules only when feature is activated
- `bundle-preload` — Preload on hover/focus for perceived speed

#### 3 · Server-Side Performance — HIGH (`server-*`)
- `server-auth-actions` — Authenticate server actions like API routes
- `server-cache-react` — Use `React.cache()` for per-request deduplication
- `server-cache-lru` — Use LRU cache for cross-request caching
- `server-dedup-props` — Avoid duplicate serialisation in RSC props
- `server-hoist-static-io` — Hoist static I/O (fonts, logos) to module level
- `server-no-shared-module-state` — Avoid module-level mutable state in RSC/SSR
- `server-serialization` — Minimise data passed to client components
- `server-parallel-fetching` — Restructure components to parallelise fetches
- `server-parallel-nested-fetching` — Chain nested fetches per item in `Promise.all`
- `server-after-nonblocking` — Use `after()` for non-blocking operations

#### 4 · Client-Side Data Fetching — MEDIUM-HIGH (`client-*`)
- `client-swr-dedup` — Use SWR for automatic request deduplication
- `client-event-listeners` — Deduplicate global event listeners
- `client-passive-event-listeners` — Use passive listeners for scroll
- `client-localstorage-schema` — Version and minimise localStorage data

#### 5 · Re-render Optimization — MEDIUM (`rerender-*`)
- `rerender-defer-reads` — Don't subscribe to state only used in callbacks
- `rerender-memo` — Extract expensive work into memoised components
- `rerender-memo-with-default-value` — Hoist default non-primitive props
- `rerender-dependencies` — Use primitive dependencies in effects
- `rerender-derived-state` — Subscribe to derived booleans, not raw values
- `rerender-derived-state-no-effect` — Derive state during render, not effects
- `rerender-functional-setstate` — Use functional `setState` for stable callbacks
- `rerender-lazy-state-init` — Pass function to `useState` for expensive values
- `rerender-simple-expression-in-memo` — Avoid memo for simple primitives
- `rerender-split-combined-hooks` — Split hooks with independent dependencies
- `rerender-move-effect-to-event` — Put interaction logic in event handlers
- `rerender-transitions` — Use `startTransition` for non-urgent updates
- `rerender-use-deferred-value` — Defer expensive renders to keep input responsive
- `rerender-use-ref-transient-values` — Use refs for transient frequent values
- `rerender-no-inline-components` — Don't define components inside components

#### 6 · Rendering Performance — MEDIUM (`rendering-*`)
- `rendering-animate-svg-wrapper` — Animate div wrapper, not SVG element
- `rendering-content-visibility` — Use `content-visibility` for long lists
- `rendering-hoist-jsx` — Extract static JSX outside components
- `rendering-svg-precision` — Reduce SVG coordinate precision
- `rendering-hydration-no-flicker` — Use inline script for client-only data
- `rendering-hydration-suppress-warning` — Suppress expected mismatches
- `rendering-activity` — Use Activity component for show/hide
- `rendering-conditional-render` — Use ternary, not `&&` for conditionals
- `rendering-usetransition-loading` — Prefer `useTransition` for loading state
- `rendering-resource-hints` — Use React DOM resource hints for preloading
- `rendering-script-defer-async` — Use `defer` or `async` on script tags

#### 7 · JavaScript Performance — LOW-MEDIUM (`js-*`)
- `js-batch-dom-css` — Group CSS changes via classes or `cssText`
- `js-index-maps` — Build `Map` for repeated lookups
- `js-cache-property-access` — Cache object properties in loops
- `js-cache-function-results` — Cache function results in module-level `Map`
- `js-cache-storage` — Cache `localStorage`/`sessionStorage` reads
- `js-combine-iterations` — Combine multiple filter/map into one loop
- `js-length-check-first` — Check array length before expensive comparison
- `js-early-exit` — Return early from functions
- `js-hoist-regexp` — Hoist `RegExp` creation outside loops
- `js-min-max-loop` — Use loop for min/max instead of sort
- `js-set-map-lookups` — Use `Set`/`Map` for O(1) lookups
- `js-tosorted-immutable` — Use `toSorted()` for immutability
- `js-flatmap-filter` — Use `flatMap` to map and filter in one pass
- `js-request-idle-callback` — Defer non-critical work to browser idle time

#### 8 · Advanced Patterns — LOW (`advanced-*`)
- `advanced-effect-event-deps` — Don't put `useEffectEvent` results in effect deps
- `advanced-event-handler-refs` — Store event handlers in refs
- `advanced-init-once` — Initialise app once per app load
- `advanced-use-latest` — `useLatest` for stable callback refs

---

## 4. `web-design-guidelines`

**SKILL.md:** `.agents/skills/web-design-guidelines/SKILL.md`
**Source:** `vercel-labs/agent-skills`

### Purpose
**Live UI compliance auditor.** Fetches the latest Vercel Web Interface Guidelines at runtime
and checks specified files against all rules, reporting findings in a terse `file:line` format.

### When to Apply
User says: "review my UI", "check accessibility", "audit design", "review UX", or
"check my site against best practices."

### How to Use
1. **Fetch** fresh guidelines from:
   ```
   https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
   ```
2. **Read** the specified files (ask user if no files/pattern provided).
3. **Check** against all rules in the fetched guidelines.
4. **Output** findings in `file:line` format as specified by the fetched guidelines.

---

## Cross-Skill Interaction Guide

| Task | Skills to activate |
|---|---|
| Build a new page from scratch | `frontend-design` → `ui-ux-pro-max` → `vercel-react-best-practices` |
| Refactor an existing React component | `vercel-react-best-practices` + `ui-ux-pro-max` (accessibility / interaction checks) |
| UI/UX review or accessibility audit | `web-design-guidelines` + `ui-ux-pro-max` |
| Choose palette, fonts, layout | `frontend-design` + `ui-ux-pro-max` (search `--design-system`) |
| Performance optimisation | `vercel-react-best-practices` (priority 1–3 first) |
| Animation / GSAP work | `ui-ux-pro-max` (`--domain gsap`) + `frontend-design` (restraint rules) |
| Pre-delivery check | `ui-ux-pro-max` pro-rules checklist + `web-design-guidelines` audit |
