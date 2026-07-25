---
baseline_commit: NO_VCS
---

# Story 1.1: Project scaffold and mount API

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a portfolio reviewer,
I want to open a standalone web demo that mounts into a page root without accounts or a framework shell,
so that Mind Void is embeddable and immediately reachable as a static site.

## Acceptance Criteria

1. **Given** a greenfield workspace matching the Architecture Structural Seed  
   **When** the project is initialized with TypeScript 7.0.2, Vite 8.1.5, and Vitest 4.1.10 and no UI framework or runtime dependencies  
   **Then** directory layout includes `src/core/`, `src/adapters/web/`, `src/app/`, `src/styles/`, `scripts/`, `test/`, and `index.html`  
   **And** `tsc --noEmit` is the only static gate (no linter installed)  
   **And** `vite build` produces a static deployable folder with no server, backend, persistence, or analytics (NFR2, NFR6, NFR7)

2. **Given** a host page provides a DOM root element  
   **When** the host calls `mountMindVoid(root, opts)` where `opts` is exactly `{ shards?, shardCount?, motion?: 'auto' | 'full' | 'reduced', audio?: boolean, seed?: number }`  
   **Then** the demo mounts into that root and returns an unmount handle that detaches listeners, cancels rAF, clears FX, stops audio, and invalidates the clock (AD-14, NFR3)  
   **And** `nodeRadius` is never an option — it is derived from surface size  
   **And** construction throws if `shardCount` is outside 2–5  
   **And** no module uses import-time singletons; only `src/app/` wires core and adapters (AD-1, AD-14)

## Tasks / Subtasks

- [x] Scaffold Vite + vanilla TypeScript package at `mind-void/` (AC: #1)
  - [x] Create `package.json` with **exact** pinned versions: `typescript@7.0.2`, `vite@8.1.5`, `vitest@4.1.10`; `dependencies: {}` (no runtime deps); no React/Svelte/Vue; no ESLint/prettier packages
  - [x] Add `vite.config.ts`, `tsconfig.json` (strict), `index.html` calling `mountMindVoid`
  - [x] Ensure Node engines note: Node 20.19+ / 22.12+ (build only)
  - [x] Scripts must support: `vite` (dev), `vite build`, `tsc --noEmit`, `vitest` (for later stories) — script *names* are free; capabilities are not
- [x] Create Structural Seed directory tree (AC: #1)
  - [x] Dirs: `src/core/`, `src/adapters/web/`, `src/app/`, `src/styles/`, `scripts/`, `test/`
  - [x] Placeholders allowed for later-story files (empty modules or minimal stubs that typecheck) — do **not** implement VoidCanvas, FSM, tokens pipeline, DomView, adapters, FX, or audio behavior
  - [x] Keep filenames kebab-case; any generated file must use `.generated.` when introduced (not required until Story 1.2)
- [x] Implement `mountMindVoid` in `src/app/mount.ts` (AC: #2)
  - [x] Export `mountMindVoid(root: HTMLElement, opts?: MountOpts): UnmountHandle`
  - [x] `MountOpts` = exactly `{ shards?; shardCount?; motion?: 'auto' | 'full' | 'reduced'; audio?: boolean; seed?: number }` — no `nodeRadius`, no extras
  - [x] Validate `shardCount` when provided: throw if outside 2–5
  - [x] Mount a minimal placeholder into `root` (enough to prove embed + unmount); full VoidCanvas is Story 1.3
  - [x] Return unmount that: removes mounted DOM / listeners, cancels any rAF started, clears FX bus if present, stops audio if present, invalidates clock if present (no-ops OK for pieces not yet wired)
- [x] Wire standalone `index.html` as one caller of the same public entry (AC: #1, #2)
  - [x] Provide a root element; call `mountMindVoid`; no accounts, no analytics, no service worker
- [x] Verify gates (AC: #1)
  - [x] `tsc --noEmit` passes
  - [x] `vite build` emits static `dist/` (or configured outDir) with no server code
  - [x] Confirm no linter config/packages exist
- [x] Guardrails check (AC: #2)
  - [x] No import-time singletons / module-level mutable globals for collaborators
  - [x] Only `src/app/` imports both `src/core/` and `src/adapters/web/`
  - [x] Core imports nothing outside `src/core/`

### Review Findings

- [x] [Review][Patch] Fix Node engines to match Vite 8 (`^20.19.0 || >=22.12.0`) [mind-void/package.json]
- [x] [Review][Patch] Remount clears prior `[data-mind-void]` shells under the same root [mind-void/src/app/mount.ts]
- [x] [Review][Patch] Normalize `opts: null` via `opts ?? {}` [mind-void/src/app/mount.ts]
- [x] [Review][Patch] Listener registry stores `options` for capture/passive-safe detach [mind-void/src/app/mount.ts]
- [x] [Review][Patch] Named no-op `clearFx` / `stopAudio` / `invalidateClock` on unmount [mind-void/src/app/mount.ts]
- [x] [Review][Defer] Embed height chain for hosts without sized roots — deferred to Story 1.3 VoidCanvas
- [x] [Review][Defer] Package `exports` for library embed entry — deferred until portfolio shell consumes as a package

## Dev Notes

### Scope boundary (critical)

This story is **scaffold + public mount API only**. It must leave a compiling, buildable, mountable shell.

**Do NOT implement in 1.1:**
| Deferred to | Content |
| --- | --- |
| 1.2 | `scripts/gen-tokens.ts`, `tokens.generated.css`, `motion.generated.ts`, `copy.generated.ts` |
| 1.3 | `VoidCanvas` / `Surface`, closed layer stack, vignette, ResizeObserver rect cache |
| 1.4 | `ShardGeometry`, idle DecisionNode, DomView shard render |
| 1.5 | Hint / thesis / architecture credit microcopy |
| Epic 2 | FSM, intents, pointer/keyboard adapters, Solo/Mute, cursor, focus |
| Epic 3 | Hold/Eliminate, AudioPort, EffectBus, ParticleEngine, full Vitest suite |

### Stack (locked — do not drift)

| Package | Version |
| --- | --- |
| TypeScript | 7.0.2 |
| Vite | 8.1.5 |
| Vitest | 4.1.10 |
| Node (build) | 20.19+ / 22.12+ |
| UI framework | **none** |
| Runtime deps | **none** |
| Linter | **none** (`tsc --noEmit` only) |

Architecture verified these versions on 2026-07-25. Pin exactly; do not “upgrade while scaffolding.”

**Why no linter:** TypeScript 7.0 lacks the programmatic compiler API until 7.1; `typescript-eslint` peers below 6.1 and cannot install cleanly. Do not add ESLint “just for JS files.”

### Package location

Create the Vite app at workspace path:

```text
mind-void/
```

matching Architecture **Structural Seed** (package root name `mind-void/`). BMad planning artifacts stay in `_bmad-output/`; application code lives under `mind-void/`.

### Target tree (Structural Seed)

```text
mind-void/
  index.html
  vite.config.ts
  scripts/
    gen-tokens.ts              # stub OK — real generator is Story 1.2
  src/
    core/                      # pure: no DOM, no timers, no audio
      decision-node-fsm.ts     # stub OK — Epic 2
      shard-geometry.ts        # stub OK — Story 1.4
      effect-bus.ts            # stub OK — Epic 3
      intents.ts               # stub OK — Epic 2
      snapshot.ts              # stub OK — Epic 2
      ports.ts                 # stub OK — Clock · AudioPort · FxSink · Surface types
      motion.generated.ts      # stub OK — Story 1.2
      copy.generated.ts        # stub OK — Story 1.2
    adapters/web/
      void-canvas.ts           # stub OK — Story 1.3
      pointer-adapter.ts       # stub OK — Epic 2
      keyboard-adapter.ts      # stub OK — Epic 2
      dom-view.ts              # stub OK — Story 1.4+
      particle-engine.ts       # stub OK — Epic 3
      web-audio-port.ts        # stub OK — Epic 3
      raf-clock.ts             # stub OK — Epic 3
    app/
      mount.ts                 # REQUIRED — mountMindVoid sole wiring site
    styles/
      tokens.generated.css     # stub OK — Story 1.2
      void.css                 # minimal shell styles OK
  test/                        # empty or placeholder; no required tests in 1.1
    decision-node-fsm.test.ts  # defer body to Epic 2/3
    shard-geometry.test.ts     # defer to 1.4
    effect-bus.test.ts         # defer to 3.6
```

### Hexagonal rules (AD-1)

- `src/core/` imports **nothing** outside `src/core/`; no `document` / `window` / timers / audio
- Adapters may import core; **adapters must not import each other**
- **Only** `src/app/` may import both rings
- No import-time singletons; construct collaborators inside `mountMindVoid` (AD-14)

### `mountMindVoid` contract (AD-14, NFR3)

```ts
// Exact opts surface — nothing else
type MountOpts = {
  shards?: unknown; // shape filled by later stories; accept presence without inventing persistence
  shardCount?: number;
  motion?: 'auto' | 'full' | 'reduced';
  audio?: boolean;
  seed?: number;
};

type UnmountHandle = () => void;
// or { unmount(): void } — prefer a callable () => void unless Architecture later specifies otherwise;
// AD-14 says "returns an unmount handle" that performs cleanup — callable is sufficient and embed-friendly.
```

**Must:**
- Throw when `shardCount` is provided and not in **2..5** inclusive
- Never accept `nodeRadius` as an option
- Mount into the provided `root` (not `document.body` by assumption; not viewport-coupled sizing)
- `index.html` is **one caller** of the same entry — not a privileged second path
- Config only via `opts` — no env vars, no globals, no query-string flags
- No production logging

**Unmount must (capabilities; no-op allowed until collaborators exist):**
1. Detach every listener registered by mount
2. Cancel the rAF loop
3. Clear the FX bus
4. Stop audio
5. Invalidate the clock so pending callbacks cannot touch a torn-down tree

### Minimal mount body for 1.1

Sufficient to satisfy AC without stealing later stories:
- Clear or append a single child into `root` (e.g. a full-size container with `data-mind-void` attribute)
- Store any listener/rAF/timer handles on a local closure for unmount
- Do **not** build the closed layer stack (vignette / SVG / FX / text) — that is Story 1.3
- Do **not** render shards — Story 1.4

### Vitest for 1.1

- Install and configure Vitest 4.1.10 (share `vite.config.ts` via `vitest/config` if needed)
- **No Story 1.1 AC requires passing tests** — do not invent DOM/E2E tests
- Prefer `environment: 'node'` for future core tests; do **not** add `jsdom` unless a later story needs it (Architecture: core-only tests, no DOM tests in v1)
- Leave `test/` files as empty placeholders or `describe.skip` stubs that do not fail CI — or omit test file bodies until their owning stories

### Anti-patterns to refuse

- Adding React/Vue/Svelte “just for the mount”
- Adding ESLint / Prettier / Husky
- Putting wiring in `main.ts` that bypasses `mountMindVoid`
- Importing adapters from core or adapters from adapters
- Module-level ` cons t fsm = new ...` singletons
- Accepting `nodeRadius` / `width` / `height` / theme overrides in opts
- Implementing Solo/Mute, hold, eliminate, particles, or audio “while we’re here”
- Viewport units (`100vh` root assumption) as the sizing contract — size to mount root

### Project Structure Notes

- Workspace already contains BMad (`_bmad/`, `_bmad-output/`). Application code = `mind-void/`.
- Greenfield: no existing `package.json` at workspace root — create under `mind-void/`.
- Naming: kebab-case source files per Architecture Consistency Conventions.
- Ids later: opaque strings (`node-1`, `shard-a`) — not needed in 1.1.

### Testing requirements (this story)

| Gate | Required |
| --- | --- |
| `tsc --noEmit` | Yes — must pass |
| `vite build` | Yes — must produce static deployable output |
| Vitest suite green | Vitest installed; no mandated tests yet |
| DOM / E2E | Forbidden in v1 |

### Latest tech notes (2026-07-25 stack)

- Vitest 4.1 supports Vite 8 and prefers the installed `vite` package — configure via `defineConfig` from `vitest/config`, not a separate outdated Vite peer.
- Keep Vitest on **node** environment for pure-core future tests; skip jsdom.
- Do not add `@typescript-eslint/*` — peer conflict with TS 7.0.2 is an Architecture-locked reason for no linter.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 1.1]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-mind-void-2026-07-25/ARCHITECTURE-SPINE.md` — AD-1, AD-14, Stack, Structural Seed, Operational envelope, Consistency Conventions]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-mind-void-2026-07-25/.memlog.md` — stack / composition root / no linter]
- [Source: `_bmad-output/planning-artifacts/epics.md` — NFR2, NFR3, NFR6, NFR7]
- [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-07-25.md` — READY; Story 1.1 is architecture starter]

### Previous story intelligence

None — first story in Epic 1 / greenfield.

### Git intelligence

No application commits yet; planning artifacts only. Establish clean first implementation commit patterns under `mind-void/` when the user requests commits.

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Debug Log References

- `npm install` / `typecheck` / `test` / `build` via `C:\Program Files\nodejs` (npm not on default shell PATH)
- Node v24.18.0; pinned stack verified: typescript 7.0.2, vite 8.1.5, vitest 4.1.10

### Completion Notes List

- Greenfield `mind-void/` package matches Architecture Structural Seed layout with stub modules for later stories.
- `mountMindVoid` is the sole public entry; `index.html` → `src/main.ts` is one caller.
- `assertValidShardCount` lives in pure core; Vitest covers 2–5 / out-of-range / non-integer.
- Unmount removes shell + listener/rAF teardown hooks; FX/audio/clock cleanup are documented no-ops until Epic 3 wiring.
- Gates: `tsc --noEmit` pass; `vitest run` 3 passed / 3 todo suites skipped; `vite build` → static `dist/`.
- No linter packages; `dependencies: {}`.
- Code review patches applied: engines range, remount orphan clear, null opts, listener options, named unmount no-ops.

### File List

- mind-void/package.json
- mind-void/package-lock.json
- mind-void/tsconfig.json
- mind-void/vite.config.ts
- mind-void/index.html
- mind-void/.gitignore
- mind-void/scripts/gen-tokens.ts
- mind-void/src/main.ts
- mind-void/src/app/mount.ts
- mind-void/src/core/shard-count.ts
- mind-void/src/core/decision-node-fsm.ts
- mind-void/src/core/shard-geometry.ts
- mind-void/src/core/effect-bus.ts
- mind-void/src/core/intents.ts
- mind-void/src/core/snapshot.ts
- mind-void/src/core/ports.ts
- mind-void/src/core/motion.generated.ts
- mind-void/src/core/copy.generated.ts
- mind-void/src/adapters/web/void-canvas.ts
- mind-void/src/adapters/web/pointer-adapter.ts
- mind-void/src/adapters/web/keyboard-adapter.ts
- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/adapters/web/particle-engine.ts
- mind-void/src/adapters/web/web-audio-port.ts
- mind-void/src/adapters/web/raf-clock.ts
- mind-void/src/styles/void.css
- mind-void/src/styles/tokens.generated.css
- mind-void/test/shard-count.test.ts
- mind-void/test/decision-node-fsm.test.ts
- mind-void/test/shard-geometry.test.ts
- mind-void/test/effect-bus.test.ts

## Change Log

- 2026-07-25: Story 1.1 implemented — Vite+TS scaffold, mount API, Structural Seed stubs, core shardCount tests.
- 2026-07-25: Code review patches applied; story marked done.
