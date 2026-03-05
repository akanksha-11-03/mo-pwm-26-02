# Copilot Instructions — MO-PWM (AEM Edge Delivery Services)

## Project Overview

This is an **AEM Edge Delivery Services (EDS) xwalk project** for Motilal Oswal PWM, based on `@adobe/aem-boilerplate` v1.3.0. Content is authored in AEM Universal Editor and delivered via Edge Delivery. There is no bundler — JS/CSS are loaded natively by the browser.

## Architecture

### Loading Pipeline (`scripts/scripts.js`)
1. **Eager** — `decorateMain()` → buttons, icons, sections, blocks → load first section
2. **Lazy** — header/footer fragments, remaining sections, `lazy-styles.css`, fonts
3. **Delayed** — `delayed.js` loaded after 3 seconds

### Blocks (`blocks/<name>/`)
- Each block: `<name>.js` + `<name>.css`, auto-loaded when present on page
- JS must `export default function decorate(block) { ... }`
- CSS loads automatically alongside the JS
- Block model definitions in `blocks/<name>/_<name>.json` (underscore-prefixed partials)
- Example: `blocks/cards/cards.js` — restructures DOM, uses `createOptimizedPicture()`

### Components (`components/<name>/`)
- **Not auto-loaded** — manually imported in `scripts.js` and called explicitly
- Export named functions (not `default decorate`), e.g. `export function linkToBtn(document)`
- Load their own CSS via `loadCSS()` internally
- Example: `components/How-we-serve-you/` converts marked `<li>` elements to styled `<a>` links

## Key Utilities (from `scripts/aem.js`)

| Function | Use |
|---|---|
| `loadCSS(href)` | Dynamically load a stylesheet |
| `createOptimizedPicture(src, alt, eager, breakpoints)` | Responsive `<picture>` with WebP |
| `decorateIcons(element)` | Renders `span.icon.icon-<name>` → `<img src="/icons/<name>.svg">` |
| `decorateButtons(element)` | Converts links in `<p>`/`<strong>`/`<em>` to styled buttons |
| `readBlockConfig(block)` | Parses key-value metadata from 2-column block structure |
| `getMetadata(name)` | Reads `<meta>` tag values |
| `buildBlock(name, content)` | Programmatically creates a block DOM node |

## Content Modeling (Universal Editor)

Three root JSON files define the authoring experience — **never edit directly**:
- `component-definition.json` — available components and groups
- `component-models.json` — editable fields per component
- `component-filters.json` — nesting/containment rules

Edit the **partial files** in `models/` (e.g. `models/_component-models.json`), then run:
```sh
npm run build:json
```

## Dev Workflow

```sh
npm i                  # Install dependencies
aem up                 # Start local dev server (requires @adobe/aem-cli globally)
npm run lint           # ESLint (airbnb-base) + Stylelint
npm run lint:fix       # Auto-fix lint issues
npm run build:json     # Merge model partials → root JSON files
```

## Conventions

- **File naming**: blocks use lowercase-hyphenated names; block folder = block name
- **No build step** for JS/CSS — write vanilla ES modules, no TypeScript, no bundling
- **SCSS**: used in some blocks (e.g. `blocks/header n/`) but compiled externally, not via npm scripts
- **Icons**: SVG files in `icons/` — reference via `<span class="icon icon-<name}>`
- **Fonts**: self-hosted woff2 in `fonts/`, declared in `styles/fonts.css`, loaded strategically (desktop-first, cached in sessionStorage)
- **CSS variables**: defined in `styles/styles.css` `:root` — use `--background-color`, `--text-color`, `--link-color`, `--body-font-family`, `--heading-font-family`, etc.
- **Responsive breakpoint**: `900px` for desktop
- **AEM instrumentation**: use `moveInstrumentation(from, to)` from `scripts.js` when restructuring DOM to preserve Universal Editor attributes (`data-aue-*`)
