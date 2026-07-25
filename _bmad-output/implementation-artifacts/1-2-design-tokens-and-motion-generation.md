---
baseline_commit: NO_VCS
---

# Story 1.2: Design tokens and motion generation

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a reviewer experiencing the Emerald atmosphere,
I want all colours, motion timings, spacing, and fixed strings to come from one generated source,
so that the dark emerald void stays coherent and never drifts from DESIGN.md.

## Acceptance Criteria

1. **Given** `DESIGN.md` frontmatter is the token authority (AD-16)  
   **When** `scripts/gen-tokens.ts` runs  
   **Then** it emits CSS custom properties (`--mv-*`) for paint tokens into `src/styles/tokens.generated.css`  
   **And** it emits TypeScript `MotionProfile` artifacts (full + reduced) into `src/core/motion.generated.ts`  
   **And** it emits the three fixed product strings into `src/core/copy.generated.ts` (AD-20)  
   **And** generated filenames contain `.generated.` and are not hand-edited  
   **And** no colour, duration, or spacing literal appears elsewhere in source (UX-DR1, UX-DR2, FR2)

2. **Given** `motion: 'auto' | 'full' | 'reduced'` at mount  
   **When** reduced motion is selected (explicit or `prefers-reduced-motion` under `auto`)  
   **Then** the reduced `MotionProfile` is injected — phase graph unchanged; pulse/ambient/overshoot switches off by data (AD-5, UX-DR15 baseline)

## Tasks / Subtasks

- [x] Implement `scripts/gen-tokens.ts` (AC: #1)
  - [x] Read UX `DESIGN.md` frontmatter as sole authority (path relative to repo / package)
  - [x] Emit `src/styles/tokens.generated.css` with `--mv-*` for colors, spacing, rounded, typography sizes/weights, motion durations/easings used by CSS
  - [x] Emit `src/core/motion.generated.ts` with `MotionProfile` type + `motionFull` + `motionReduced`
  - [x] Emit `src/core/copy.generated.ts` with hint / thesis / architectureCredit exact strings (AD-20)
  - [x] Add npm script to run the generator (e.g. `gen:tokens`); no new runtime deps — YAML parse without shipping a browser dependency
- [x] Wire reduced/full profile selection at mount (AC: #2)
  - [x] Add pure helper `resolveMotionProfile(preference, prefersReduced)` in core (or next to generated motion)
  - [x] `mountMindVoid` selects profile from `opts.motion` (`auto` → match `prefers-reduced-motion`)
  - [x] Apply CSS custom properties from the chosen profile onto the mount shell (so DomView later shares identical values)
  - [x] Import `tokens.generated.css` from the app entry / mount path
- [x] Purge scattered literals (AC: #1)
  - [x] Replace hard-coded colour in `void.css` with generated tokens (e.g. void-base / abyss)
  - [x] Confirm no hex/duration/spacing literals remain in non-generated source (generator script + DESIGN.md excluded)
- [x] Verify gates
  - [x] `npm run gen:tokens` regenerates all three artifacts
  - [x] `tsc --noEmit` passes
  - [x] `vitest run` still passes (add unit tests for `resolveMotionProfile` + reduced switches)
  - [x] `vite build` still produces static `dist/`

### Review Findings

- [x] [Review][Patch] Scope paint tokens to `.mv-shell` instead of `:root` for embed isolation [scripts/gen-tokens.ts]
- [x] [Review][Patch] Parse quoted spacing keys (`'1'`…`'7'`) in DESIGN.md frontmatter [scripts/gen-tokens.ts]

## Dev Notes

(See earlier sections in history — implementation complete.)

### Previous story intelligence (1.1)

- Package root: `mind-void/`
- Node PATH: prepend `C:\Program Files\nodejs` on this machine

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- `npm run gen:tokens` via `node --experimental-strip-types`
- Gates: typecheck / vitest 8 passed / vite build

### Completion Notes List

- Generator reads DESIGN.md frontmatter; emits CSS + MotionProfile full/reduced + productCopy.
- Reduced profile: travel compressed; holdCommit 400 + seamFlash 120 retained; pulse/ambient/overshoot false.
- `resolveMotionProfile` + mount injection of `--mv-profile-*` on shell.
- Paint tokens scoped to `.mv-shell`; void.css uses `var(--mv-void-base)`.
- Acceptance audit: ACs satisfied.

### File List

- mind-void/scripts/gen-tokens.ts
- mind-void/src/styles/tokens.generated.css
- mind-void/src/core/motion.generated.ts
- mind-void/src/core/copy.generated.ts
- mind-void/src/core/resolve-motion-profile.ts
- mind-void/src/app/mount.ts
- mind-void/src/main.ts
- mind-void/src/styles/void.css
- mind-void/package.json
- mind-void/tsconfig.json
- mind-void/test/resolve-motion-profile.test.ts

## Change Log

- 2026-07-25: Story 1.2 implemented — token generation, MotionProfile full/reduced, mount injection.
- 2026-07-25: Code review patches — scoped CSS tokens, quoted spacing keys; story marked done.
