# StudyFlow AI Dashboard

## Project overview

StudyFlow AI is a React prototype for a student study workspace. It runs in Figma Make and demonstrates a dashboard, planner, study session, review flow, materials library, and an illustrative learning copilot. There is no backend, authentication, persistence, document processing, source retrieval, or live AI integration.

Treat the current UI as a deterministic prototype: preserve the explicit demo/source disclaimers and do not present illustrative data as verified learning evidence.

## Runtime and commands

- Node.js: 22
- Package manager: pnpm 10.34.3
- Dev server: already managed by Figma Make on `$PORT` (default `8443`); do not start a second server unless explicitly asked.
- Preview: use the Figma Make preview panel.
- Install: `pnpm install`
- Development: `pnpm dev`
- Production build: `pnpm build`
- Preview build: `pnpm preview`
- Format: `pnpm format`

When pnpm is unavailable in the shell, use the project-local binaries only for verification; do not modify package-manager configuration just to run a formatter.

## Project structure

```text
.
├── .figma/make/          Figma Make scripts and site configuration; keep committed
├── public/brand/         Runtime brand assets, favicons, and the consolidated brand kit
├── src/
│   ├── App.tsx           Main prototype UI, state, interactions, and demo data
│   ├── brand.css         StudyFlow design tokens
│   ├── index.css         Tailwind import, theme variables, global styles, responsive CSS
│   ├── main.tsx          React entrypoint
│   └── vite-env.d.ts     Vite type declarations
├── AGENTS.md             Repository instructions
├── CLAUDE.md             Claude Code instructions
├── index.html            Vite document shell and favicon links
├── package.json          Scripts and dependencies
├── tsconfig.json         TypeScript configuration
├── vite.config.ts        Vite, Tailwind, and Figma Make integration
└── .mise.toml            Node and pnpm versions
```

`node_modules/` and generated build output are local artifacts. Do not edit or document files inside `node_modules/`.

## Application architecture

- `src/main.tsx` mounts `App` into `#root` and imports the global stylesheet.
- `src/App.tsx` is intentionally a single-page prototype. It owns navigation, demo state, modal flows, task editing, planner interactions, study timer, quiz state, file-name listing, and copilot messages.
- Navigation is state-based (`Dashboard`, `Planner`, `Study`, `Review`, `Materials`), not router-based. Do not add a routing dependency for prototype changes.
- `Button`, `Card`, and `Modal` are local primitives in `App.tsx`; reuse them before creating new wrappers.
- Data is in-memory and resets on reload. File selection stores only local filenames and status labels; it does not upload or parse files.
- `lucide-react` is the existing icon library. Use it instead of introducing another icon package.

## Styling conventions

- Tailwind CSS v4 is enabled through `@tailwindcss/vite`; there is no Tailwind config or PostCSS config to add.
- Existing UI styling is primarily in `src/index.css`, with brand tokens in `src/brand.css`. Match the existing CSS class naming and layout patterns.
- Keep CSS imports at the top of `src/index.css`.
- Put global element defaults inside `@layer base` so Tailwind utilities can override them.
- Use the existing StudyFlow tokens (`--sf-*`) and semantic color variables before adding raw colors.
- Preserve the responsive breakpoints, keyboard focus styles, reduced-motion handling, and forced-colors support.
- Prefer the existing `.button`, `.primary`, `.secondary`, `.card`, `.tabs`, `.info-banner`, and `.warning-banner` patterns over one-off markup.

## Accessibility and interaction requirements

- Keep interactive controls keyboard accessible and use semantic HTML first.
- Preserve visible `:focus-visible` styles, the skip link, modal focus restoration, dialog escape handling, and meaningful `aria-label`/`aria-current`/`aria-pressed` attributes.
- Do not rely on color alone for status, deadlines, completion, or errors.
- Keep the 44px minimum interactive target sizing already used by the prototype.
- Respect `prefers-reduced-motion` and do not add animation that bypasses the existing accessibility rules.
- When changing navigation or page content, preserve focus movement to the page heading.

## Brand assets

- App code references deployed assets through `/brand/...`, which resolves to `public/brand/`.
- Keep runtime logo and favicon paths stable unless every caller is updated.
- The complete StudyFlow brand kit is consolidated under `public/brand/`; update the README there when adding or changing brand assets.
- Use the light transparent horizontal logo on the current light header. Use the documented dark/mono/icon variants only when the surface requires them.

## Figma Make and Vite

- Keep `.figma/make/` committed; its scripts are used to install, run, format, preview, and deploy from Figma Make.
- `vite.config.ts` contains Figma-specific plugins for site metadata, error overlay replay, React refresh fallback, story-kit support, and linked-package sourcemaps. Avoid removing or simplifying these plugins unless the Figma Make workflow is being changed deliberately.
- The Vite server uses `$PORT`, defaults to `8443`, and binds to the Figma-provided host.
- `.figma/make/site.json` currently disables indexing. Preserve that prototype/privacy behavior unless explicitly asked to change it.

## Change workflow

1. Read the relevant component and stylesheet before editing.
2. Search for all callers when changing a shared class, asset path, state value, or local primitive.
3. Prefer the smallest change that completes the requested behavior; do not introduce abstractions, routes, services, persistence, or dependencies without a concrete requirement.
4. Run `pnpm format` (or the local formatter binary when pnpm is unavailable) on changed source files.
5. Run `pnpm build` for non-trivial UI or configuration changes and report any failure honestly.
6. Check the Figma preview for visual or interaction changes when requested or when the change affects layout.

## Prototype constraints

- Keep dates, course content, quiz answers, and messages clearly illustrative unless the task explicitly introduces a real data source.
- Do not claim mastery, source verification, document extraction, upload completion, or live AI behavior when the prototype does not provide it.
- Avoid adding analytics, external services, or persistent storage without explicit authorization.
- Do not commit secrets, `.env` files, generated build output, or local tooling state.
