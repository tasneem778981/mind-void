---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/prd.md
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/addendum.md
  - _bmad-output/planning-artifacts/architecture/architecture-mind-void-2026-07-25/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-mind-void-2026-07-25/.memlog.md
  - _bmad-output/planning-artifacts/ux-designs/ux-mind-void-2026-07-25/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-mind-void-2026-07-25/EXPERIENCE.md
project_name: Mind Void
knownGaps:
  - 'AD-12 (Eliminate floor at 2 shards + rim inert) is locked in Architecture but missing from EXPERIENCE.md State Patterns; UX spine feedback owed — covered in Story 3.2 / UX-DR19; EXPERIENCE.md patch still owed'
validation:
  frCoverage: complete
  uxDrCoverage: complete
  architectureStarter: 'Story 1.1 greenfield Vite+vanilla TS Structural Seed (no named third-party starter template)'
  epicIndependence: pass
  storyForwardDeps: pass
  fileChurnNote: 'FSM/DomView/adapters touched across epics by design — sequential DecisionNode journey; consolidation considered and rejected (UJ-1 phased value)'
status: final
updated: 2026-07-25
storyCounts:
  epic1: 5
  epic2: 5
  epic3: 6
  total: 16
---

# Mind Void - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Mind Void, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Present VoidCanvas — Reviewer opens the web demo and sees a spatial VoidCanvas hosting at least one DecisionNode; no checkbox-list default metaphor; interactive without account gate; idle shards soft-pulse.
FR2: Apply Emerald theme — Coherent dark-emerald-void atmosphere across VoidCanvas background and DecisionNode states; state changes remain legible under Emerald tinting.
FR3: Render DecisionNode shards — DecisionNode presented as 2+ Shards; binary and multi-shard (≥3, ceiling 5 per UX/Architecture) both supported; cannot enter resolution below 2 shards.
FR4: Zone Solo preview — Pointer hover over shard body enters Solo (commit-oriented); no modifier keys; distinguishable from Mute on ≥2 channels simultaneously: visual zone highlight + cursor morph toward attract.
FR5: Zone Mute preview — Pointer hover over rim/close zone enters Mute (eliminate-oriented); no modifier keys; distinguishable from Solo on ≥2 channels: visual rim highlight + cursor morph toward repulse; cold-discoverable within ~60s (SM-1).
FR6: Eliminate a Shard — Reviewer can Eliminate a Shard; dissolves outward; remaining Shards redistribute; shard count decreases by one; input locked during eliminate animation; no undo in v1.
FR7: Commit a winner — Hold-to-commit (~400ms); cancel if pointer leaves shard before threshold; fuses into Solid Charge (DeferReveal); input locked during commit animation; hero moment visually readable (SM-2).
FR8: Multi-sensory tension and release — Micro-audio tension/release and cursor morph (attract vs repulse) aligned to Solo/Mute and Eliminate/Commit phases; audio start/stop with phases; Commit path includes audible release aligned to DeferReveal.
FR9: Bounded EffectBus — Visual FX for eliminate/commit/seam enqueue on capacity-limited bus (~3–5, Architecture locks 4); drop-oldest when full; responsive under spam at ~60fps target (SM-3); FX canvas `pointer-events: none`.

### NonFunctional Requirements

NFR1: Performance — Demo remains responsive at ~60fps target under interaction spam; ParticleEngine is the only rAF loop; live particles capped at 400; frame budget wins over FX completeness (SM-3).
NFR2: Operational envelope — Static site via `vite build`; no server, backend, datastore, persistence, accounts, analytics, service worker, or environment-specific config.
NFR3: Embeddability — Public entry `mountMindVoid(root, opts)` returns unmount handle; no viewport-coupled sizing; no import-time singletons; embeddable in any portfolio shell.
NFR4: Accessibility floor — Ink Primary on Void Base ≥4.5:1; Ink Faint decorative-only; keyboard floor (Tab / Enter-Space hold / Delete); focus ring ≠ charge-glow; reduced motion honored; audio never required to complete an action.
NFR5: Testability — Vitest unit coverage on pure core only (`DecisionNodeFSM`, `ShardGeometry`, `EffectBus`) with injected fake Clock; one test per transition and per input-lock window; no DOM/E2E tests in v1.
NFR6: Static analysis — TypeScript 7.0.2; `tsc --noEmit` is the only static gate; no linter in v1 (typescript-eslint peer conflict).
NFR7: Stack constraints — Vanilla TypeScript 7.0.2 + Vite 8.1.5 + Vitest 4.1.10; no UI framework; no runtime dependencies; Node 20.19+ / 22.12+ for build.
NFR8: Cold discovery — Within ~60 seconds without a control guide, reviewer can perform Solo/Mute and Eliminate/Commit (SM-1); no tooltips, coach marks, onboarding overlays, or confirmation dialogs.
NFR9: Portfolio narrative — Architecture credit always visible; leave-behind is *closure > checkboxes* (SM-4, SM-5).

### Additional Requirements

- Starter / greenfield seed: Vite + vanilla TypeScript project matching Architecture Structural Seed (`mind-void/` layout); no UI framework scaffold.
- Hexagonal paradigm: pure `src/core/` (no DOM/timers/audio); adapter ring `src/adapters/web/`; composition root `src/app/` only wiring site (AD-1, AD-14).
- Layer chain: InputAdapter role (`PointerAdapter` + `KeyboardAdapter`) → `DecisionNodeFSM` → `DomView`; FX via `EffectBus` → `ParticleEngine`.
- Surface port: `Surface` core port; `VoidCanvas` sole web implementation; adapters must not import each other (AD-21).
- FSM phases: `idle → hovering → pressing → eliminating → redistributing | committing → solid`; no `dragging` in v1.
- Input lock on `eliminating` / `redistributing` / `committing`; `solid` terminal; adapters dispatch unconditionally (AD-3).
- Device-neutral intents only: `FOCUS_SET` / `PREVIEW_SET` / `HOLD_START` / `HOLD_END` / `ELIMINATE` / `CANCEL` — **no COMMIT intent**; Clock completes hold (AD-4, AD-5).
- EffectBus capacity 4 drop-oldest = particle garnish only (`shard-eliminate`, `shard-commit`, `seam-flash`); audio/cursor/DOM lossless (AD-9).
- AudioPort: `bed-start` on first activating intent (`HOLD_START` or `ELIMINATE`), never on hover; cues synthesised, no audio assets (AD-11).
- AD-12 Eliminate floor: at 2 shards refuse `ELIMINATE`, coerce mute preview to neutral, rim inert; Commit only exit. (Known gap: not yet in EXPERIENCE.md State Patterns.)
- Focus vs preview split; focus survives Eliminate; keyboard hold semantics (AD-8, AD-13, AD-15, AD-25).
- Design tokens: `DESIGN.md` frontmatter authority; `scripts/gen-tokens.ts` generates CSS custom properties + `MotionProfile` + copy (AD-16, AD-20).
- `mountMindVoid` opts: `{ shards?, shardCount?, motion?: 'auto'|'full'|'reduced', audio?: boolean, seed?: number }`; `nodeRadius` derived (AD-14).
- Pointer mapping fixed: body `pointerdown` → `HOLD_START`; rim `pointerdown` → `ELIMINATE`; no `click` listener; `setPointerCapture` + `touch-action: none` (AD-23).
- Touch: `event.pointerType === 'touch'` emits no `PREVIEW_SET`; same hold/eliminate otherwise (AD-19).
- Emission order: snapshot subscribers → AudioPort → EffectBus; no synchronous re-entrant dispatch (AD-24).
- Coordinate rule: canvas-local top-left CSS px across module boundaries; ShardGeometry emits node-local + placing transform (AD-22).
- Construction throws outside shard count 2–5.
- Deferred out of v1: dragging, Noise/Promise skins, multi-node, mobile adapter, persistence, undo, linting, DOM/E2E tests, seal-burst FX, i18n.

### UX Design Requirements

UX-DR1: Implement Emerald token set from `DESIGN.md` frontmatter as generated CSS custom properties (`--mv-*`) — void vignette, shard/solid/cursor/focus/hold/ambient/ink tokens; no scattered colour literals.
UX-DR2: Generate motion profiles (full + reduced) from DESIGN.md motion tokens; DomView consumes identical values as CSS custom properties; FSM reads same profile via injected Clock.
UX-DR3: VoidCanvas shell — full-bleed vignette background, closed render layer stack (vignette → SVG shards → FX canvas `pointer-events: none` → text); sized to mount root not viewport.
UX-DR4: Ambient field — sparse ambient-spark drift inside ParticleEngine internal emitter; never on EffectBus; never interactive.
UX-DR5: Shard geometry visuals — binary single-seam halves (~3px offset) and radial 3–5 multi-shard; hard corners; seam over fills; opacity idle pulse (never scale pulse).
UX-DR6: Solo treatment — shard-face-solo + charge-glow, attract cursor (18px ring, inward ticks, centre dot), preview-in 120ms; always paired with cursor channel.
UX-DR7: Mute treatment — shard-face-mute + repulse-edge, glow off, repulse cursor (12px ring, outward ticks, no dot); rim band 14px; paired channels.
UX-DR8: Custom cursor drawn inside mount root (`cursor: none` on surface); mode from snapshot via DomView; position from PointerAdapter; never written to `document.body`/`:root`.
UX-DR9: Hold progress stroke along shard perimeter over hold-commit 400ms; cancel/rewind on leave over preview-out.
UX-DR10: Eliminate visual — outward dissolve 220ms, cut-flash one-frame (CSS lossless), redistribute 300ms; no undo affordance.
UX-DR11: Commit / DeferReveal visual — fuse-magnetize 260ms + seam-flash 120ms + solid-settle 320ms with ease-magnetize overshoot; Solid Charge still (no pulse).
UX-DR12: Focus ring — focus-ring token, 2px offset; keyboard only; never charge-glow; never shown as Solo preview.
UX-DR13: Fixed microcopy lifecycle — hint `something here is unresolved.` until first solid; thesis `closure, not checkboxes.` for thesis-hold ~4s then fade; architecture credit always bottom-right; generated copy module, DomView-owned (AD-20).
UX-DR14: Keyboard floor — Tab/Shift+Tab traverse shards; Enter/Space held = Commit with same progress; Delete/Backspace = Eliminate; bare keys only; focus ≠ preview.
UX-DR15: Reduced motion — pulse/ambient/overshoot off; compressed durations; seam-flash and audible release retained; phase graph unchanged.
UX-DR16: Touch degradation — no preview state; tap body = hold Commit; tap rim = Eliminate; custom cursor hidden for touch.
UX-DR17: Banned UI — no tooltips, coach marks, onboarding overlays, confirmation dialogs, modifier keys, drag-to-reorder, right-click menus, celebration/confetti, red/amber error colours.
UX-DR18: Cold load — exactly one centered DecisionNode, 2–5 shards, dark-only, hint + architecture credit visible.
UX-DR19: AD-12 UX alignment (known gap) — when shard count is 2, rim must be inert (no Mute highlight, no repulse cursor, no eliminate-cut); Commit is sole exit. Architecture-locked; EXPERIENCE.md State Patterns still need a rim-inert row (feedback owed, not epic blocker).

### FR Coverage Map

FR1: Epic 1 — Present VoidCanvas
FR2: Epic 1 — Apply Emerald theme
FR3: Epic 1 — Render DecisionNode shards
FR4: Epic 2 — Zone Solo preview
FR5: Epic 2 — Zone Mute preview
FR6: Epic 3 — Eliminate a Shard
FR7: Epic 3 — Commit a winner
FR8: Epic 3 — Multi-sensory tension and release
FR9: Epic 3 — Bounded EffectBus

## Epic List

### Epic 1: Enter the Void
A reviewer opens the web demo and sees Mind Void — a dark emerald VoidCanvas with one soft-pulsing DecisionNode at center, hint line, and architecture credit — with no account gate and no checkbox-list metaphor.
**FRs covered:** FR1, FR2, FR3

### Epic 2: Feel the Charge
A reviewer discovers Solo vs Mute by moving across shard body and rim (and via the keyboard floor), with two mandatory sensory channels and no modifier keys — teaching Eliminate vs Commit without a guide.
**FRs covered:** FR4, FR5

### Epic 3: Close the Loop
A reviewer Eliminates weak options and hold-Commits a winner into a Solid Charge (DeferReveal), with multi-sensory tension/release, input locks, AD-12 eliminate floor, and bounded particle FX under spam.
**FRs covered:** FR6, FR7, FR8, FR9

## Epic 1: Enter the Void

A reviewer opens the web demo and sees Mind Void — a dark emerald VoidCanvas with one soft-pulsing DecisionNode at center, hint line, and architecture credit — with no account gate and no checkbox-list metaphor.

**FRs covered:** FR1, FR2, FR3
**NFRs:** NFR2, NFR3, NFR6, NFR7, NFR9 (credit visible)
**UX-DRs:** UX-DR1, UX-DR2, UX-DR3, UX-DR4 (shell readiness), UX-DR5, UX-DR13 (hint + credit), UX-DR17, UX-DR18

### Story 1.1: Project scaffold and mount API

As a portfolio reviewer,
I want to open a standalone web demo that mounts into a page root without accounts or a framework shell,
So that Mind Void is embeddable and immediately reachable as a static site.

**Acceptance Criteria:**

**Given** a greenfield workspace matching the Architecture Structural Seed
**When** the project is initialized with TypeScript 7.0.2, Vite 8.1.5, and Vitest 4.1.10 and no UI framework or runtime dependencies
**Then** directory layout includes `src/core/`, `src/adapters/web/`, `src/app/`, `src/styles/`, `scripts/`, `test/`, and `index.html`
**And** `tsc --noEmit` is the only static gate (no linter installed)
**And** `vite build` produces a static deployable folder with no server, backend, persistence, or analytics (NFR2, NFR6, NFR7)

**Given** a host page provides a DOM root element
**When** the host calls `mountMindVoid(root, opts)` where `opts` is exactly `{ shards?, shardCount?, motion?: 'auto' | 'full' | 'reduced', audio?: boolean, seed?: number }`
**Then** the demo mounts into that root and returns an unmount handle that detaches listeners, cancels rAF, clears FX, stops audio, and invalidates the clock (AD-14, NFR3)
**And** `nodeRadius` is never an option — it is derived from surface size
**And** construction throws if `shardCount` is outside 2–5
**And** no module uses import-time singletons; only `src/app/` wires core and adapters (AD-1, AD-14)

### Story 1.2: Design tokens and motion generation

As a reviewer experiencing the Emerald atmosphere,
I want all colours, motion timings, spacing, and fixed strings to come from one generated source,
So that the dark emerald void stays coherent and never drifts from DESIGN.md.

**Acceptance Criteria:**

**Given** `DESIGN.md` frontmatter is the token authority (AD-16)
**When** `scripts/gen-tokens.ts` runs
**Then** it emits CSS custom properties (`--mv-*`) for paint tokens into `src/styles/tokens.generated.css`
**And** it emits TypeScript `MotionProfile` artifacts (full + reduced) into `src/core/motion.generated.ts`
**And** it emits the three fixed product strings into `src/core/copy.generated.ts` (AD-20)
**And** generated filenames contain `.generated.` and are not hand-edited
**And** no colour, duration, or spacing literal appears elsewhere in source (UX-DR1, UX-DR2, FR2)

**Given** `motion: 'auto' | 'full' | 'reduced'` at mount
**When** reduced motion is selected (explicit or `prefers-reduced-motion` under `auto`)
**Then** the reduced `MotionProfile` is injected — phase graph unchanged; pulse/ambient/overshoot switches off by data (AD-5, UX-DR15 baseline)

### Story 1.3: VoidCanvas surface and closed layer stack

As a reviewer,
I want a full-bleed spatial VoidCanvas sized to the mount root,
So that the demo reads as depth-first atmosphere rather than a dashboard or list.

**Acceptance Criteria:**

**Given** `mountMindVoid` has been called on a root
**When** the surface initializes
**Then** `VoidCanvas` implements the core `Surface` port (layers, size, DPR, `clientToLocal`) and is injected — adapters never import each other (AD-21)
**And** the closed layer stack bottom-to-top is: vignette background → SVG shard layer → FX canvas (`pointer-events: none`) → text layer (UX-DR3, FR1, FR9 canvas rule)
**And** layers size to the mount root, not the viewport (NFR3)
**And** Emerald vignette uses generated void tokens (void-abyss / void-base / void-haze) (FR2, UX-DR1)
**And** no header, toolbar, cards, tooltips, coach marks, overlays, or confirmation dialogs exist (UX-DR17)
**And** no checkbox-list layout is shown as the default metaphor (FR1)

**Given** the mount root resizes, scrolls, or a gesture starts
**When** client-to-local conversion is needed
**Then** only `VoidCanvas` calls `getBoundingClientRect` on its own root
**And** the cached rect invalidates via `ResizeObserver`, window `scroll`/`resize`, and unconditionally at gesture start (AD-6)

### Story 1.4: ShardGeometry and idle DecisionNode

As a reviewer,
I want to see one centered cracked DecisionNode with soft-pulsing shards at cold load,
So that unfinished intention reads as suspended energy, not a static flat shape.

**Acceptance Criteria:**

**Given** a pure `ShardGeometry` module in `src/core/`
**When** it maps `(shardCount, nodeRadius, seamConfig)` for counts 2–5
**Then** it returns node-local polygons, centroids, unit outward normals, rim-band inset paths, and placing transforms
**And** binary uses a single center seam (~3px offset along seam normal); 3–5 use radial seams (~3px outward along bisector) (AD-6, AD-22, UX-DR5, FR3)
**And** no other module computes shard geometry or recovers it via `getBBox` / `getBoundingClientRect`

**Given** cold load with default or configured `shardCount` in 2–5
**When** DomView renders from the initial snapshot
**Then** exactly one DecisionNode is centered on the VoidCanvas (UX-DR18, FR1)
**And** each shard has a body path and a rim-band path from `ShardGeometry`, rim above body, keyed by shard id (AD-7)
**And** shards use hard corners, seam drawn over fills, idle opacity pulse toward charge-pulse on `pulse-idle` with `ease-calm` — never a scale pulse (UX-DR5, FR1)
**And** DomView writes `data-*` / CSS custom properties one-way from snapshot; DOM is never read as state (AD-2)
**And** Vitest covers `ShardGeometry` for binary and multi-shard layouts (NFR5 baseline)

### Story 1.5: Cold-load microcopy

As a portfolio reviewer,
I want a quiet hint and an architecture credit visible at cold load,
So that I orient without a control guide and see the systems narrative in-frame.

**Acceptance Criteria:**

**Given** cold load before any Commit
**When** the text layer renders
**Then** the hint line shows exactly `something here is unresolved.` (bottom-center, ink-faint, meta typography) (UX-DR13, UX-DR18)
**And** the architecture credit shows exactly `InputAdapter → FSM → DomView + EffectBus → ParticleEngine` (bottom-right, always visible) (NFR9, UX-DR13)
**And** no other instructional copy, tooltips, or control legends appear (UX-DR17)
**And** strings come only from `copy.generated.ts` — no string literals in components (AD-20)
**And** thesis lifecycle (`closure, not checkboxes.` after first solid) is owned by DomView + Clock but is not required to fire until Epic 3 Commit lands — stub wiring may exist without solid-trigger yet

## Epic 2: Feel the Charge

A reviewer discovers Solo vs Mute by moving across shard body and rim (and via the keyboard floor), with two mandatory sensory channels and no modifier keys — teaching Eliminate vs Commit without a guide.

**FRs covered:** FR4, FR5
**NFRs:** NFR4, NFR8
**UX-DRs:** UX-DR6, UX-DR7, UX-DR8, UX-DR12, UX-DR14, UX-DR16

### Story 2.1: FSM core — idle/hovering and device-neutral intents

As a builder,
I want a pure DecisionNodeFSM that owns idle/hovering preview state via device-neutral intents,
So that both pointer and keyboard paths share one source of truth without Web APIs in the core.

**Acceptance Criteria:**

**Given** `src/core/` with no DOM, timer, or audio imports (AD-1)
**When** `DecisionNodeFSM` is constructed with injected `Clock`, `MotionProfile`, ports stubs, and shard set
**Then** phase starts at `idle` with independent snapshot fields: `focusedShardId`, `previewShardId` + `previewMode`, `pressedShardId` (AD-2, AD-8)
**And** the intent set is exactly `FOCUS_SET`, `PREVIEW_SET`, `HOLD_START`, `HOLD_END`, `ELIMINATE`, `CANCEL` — no `COMMIT` intent (AD-4)
**And** `PREVIEW_SET` with mode `solo` or `mute` transitions `idle ↔ hovering`; `neutral` returns to `idle`
**And** adapters never gate dispatch on phase; the FSM is the sole lock/drop authority (AD-3)
**And** Vitest with a fake Clock covers idle↔hovering transitions and snapshot field independence (NFR5)

### Story 2.2: Pointer Solo and Mute zone previews

As a portfolio reviewer,
I want hovering a shard body vs rim to feel like two different verbs without modifier keys,
So that I can cold-discover Commit vs Eliminate within ~60 seconds.

**Acceptance Criteria:**

**Given** DomView renders body and rim paths per shard with data attributes (from Epic 1)
**When** `PointerAdapter` receives `pointermove` over a shard **body**
**Then** it dispatches `PREVIEW_SET` with mode `solo` for that `shardId` (zones are adapter-local; core knows modes only)
**And** DomView applies Solo treatment: shard-face-solo + charge-glow over `preview-in` (UX-DR6, FR4)
**And** no keyboard modifiers are required (FR4)

**Given** pointer is over a shard **rim** band
**When** `PREVIEW_SET` with mode `mute` is dispatched
**Then** DomView applies Mute treatment: shard-face-mute, repulse-edge, glow off (UX-DR7, FR5)
**And** rim wins on overlap via SVG z-order — adapter performs no point-in-polygon math (AD-7)
**And** FX canvas remains `pointer-events: none` and is never hit-tested
**And** Solo and Mute are visually distinguishable without relying on audio alone (FR4, FR5, NFR8)

### Story 2.3: Custom attract and repulse cursor

As a reviewer,
I want the cursor itself to pull inward on Solo and push outward on Mute,
So that the second mandatory sensory channel reinforces the verb without text.

**Acceptance Criteria:**

**Given** the surface sets `cursor: none` on the mount root
**When** snapshot `previewMode` is `solo`
**Then** DomView sets cursor mode data attribute to attract — 18px charge-glow ring, centre dot, inward ticks (UX-DR6, UX-DR8, FR4)
**When** snapshot `previewMode` is `mute`
**Then** DomView sets cursor mode to repulse — 12px repulse-edge ring, no dot, outward ticks (UX-DR7, UX-DR8, FR5)
**And** cursor **mode** is written only by DomView from the snapshot; cursor **position** is written only by PointerAdapter to the cursor element's transform (AD-10)
**And** nothing is written to `document.body` or `:root`
**And** ring size difference alone is legible at a glance (UX-DR6/7)
**And** attract and repulse fire together with their visual zone treatments — never one channel without the other (FR4, FR5)

### Story 2.4: Keyboard floor and focus ring

As a keyboard user,
I want to Tab between shards and see a focus ring that is not a Commit preview,
So that the demo remains operable without a pointer and focus never masquerades as Solo.

**Acceptance Criteria:**

**Given** each shard body path is focusable (`tabindex="0"`, accessible name from generated copy, role describing choosing an option) (AD-25)
**When** the user presses `Tab` / `Shift+Tab`
**Then** focus moves in shard-index DOM order and `KeyboardAdapter` dispatches `FOCUS_SET`
**And** DomView renders focus ring from `focusedShardId` using `focus-ring` token (2px, offset) — never `charge-glow` (UX-DR12, UX-DR14, NFR4, AD-8)
**And** a focused shard does **not** receive Solo treatment — focus ≠ preview (FR4/FR5 separation, UX-DR14)
**And** rim path, FX canvas, and ambient field are never focusable / are hidden from AT (AD-25)
**And** pointer input never sets focus; keyboard input never sets preview (AD-8)
**And** any keydown carrying a modifier is ignored (PRD non-goal / AD-15)

### Story 2.5: Touch degradation and preview re-sync

As a visitor opening the portfolio link on a touch device,
I want the demo to remain completable without hover previews,
So that phone traffic degrades gracefully without a second interaction path.

**Acceptance Criteria:**

**Given** `event.pointerType === 'touch'` (not the `pointer: coarse` media query) (AD-19)
**When** the pointer adapter handles move/down events
**Then** it emits no `PREVIEW_SET`, so `hovering` is never entered; `pressing` follows `idle` when hold begins in Epic 3
**And** the custom cursor is hidden for touch; visual zone treatment alone would carry distinction when preview exists (UX-DR16)
**And** no coarse-only intent, phase, or FX exists

**Given** the pointer is stationary after a locked phase ends, or after host resize/scroll
**When** geometry may have moved under the cursor (AD-17)
**Then** PointerAdapter re-hit-tests its cached last client position and dispatches a fresh `PREVIEW_SET` (including `neutral`)
**And** the dispatch is deferred to a microtask — never synchronous inside a snapshot callback (AD-17, AD-24)
**And** adapters may observe the snapshot to detect the edge but still must not gate dispatch on phase (AD-3)

## Epic 3: Close the Loop

A reviewer Eliminates weak options and hold-Commits a winner into a Solid Charge (DeferReveal), with multi-sensory tension/release, input locks, AD-12 eliminate floor, and bounded particle FX under spam.

**FRs covered:** FR6, FR7, FR8, FR9
**NFRs:** NFR1, NFR4, NFR5
**UX-DRs:** UX-DR4, UX-DR9, UX-DR10, UX-DR11, UX-DR13 (thesis), UX-DR15, UX-DR19

### Story 3.1: Hold-to-commit and DeferReveal to Solid Charge

As a portfolio reviewer,
I want to hold a shard until it fuses into a Solid Charge,
So that I feel DeferReveal as the hero closure moment — quiet resolution, not a checkbox.

**Acceptance Criteria:**

**Given** phase is `idle` or `hovering` and a shard body is the target
**When** `HOLD_START` is dispatched and the injected Clock reaches `hold-commit` (400ms full and reduced) without cancel
**Then** the FSM transitions `pressing → committing → solid` using `fuse-magnetize` + `solid-settle` from the MotionProfile — never a `COMMIT` intent (AD-4, AD-5, FR7)
**And** DomView shows perimeter hold-progress fill during `pressing`, then magnetize, seam brighten (`seam-flash` milestone on Clock), and Solid Charge settle with ease-magnetize overshoot (UX-DR9, UX-DR11)
**And** Solid Charge uses solid-face + solid-halo, no seam, no pulse (FR7)
**And** input is locked during `committing`; `solid` is terminal and drops all intents (AD-3)

**Given** phase is `pressing`
**When** `HOLD_END` arrives before threshold, or `PREVIEW_SET` names another shard / `neutral`, or `CANCEL` arrives
**Then** Commit cancels and progress rewinds over `preview-out`; phase returns to `hovering` if preview is live, else `idle` (FR7, AD-5)
**And** during `pressing`, a `PREVIEW_SET` naming the **pressed** shard is ignored regardless of zone so a 2px body→rim drift cannot cancel the hero commit (AD-12 / AD-17 tightening)

**Given** the node first enters `solid`
**When** DomView copy lifecycle runs
**Then** hint is replaced by `closure, not checkboxes.` for `thesis-hold` (~4s) then both fade permanently; architecture credit remains (UX-DR13, NFR9, AD-20)

**Given** reduced MotionProfile
**When** Commit resolves
**Then** travel compresses but `seam-flash` FX event and audible release are never suppressed (AD-5, UX-DR15)

### Story 3.2: Eliminate, redistribute, and AD-12 floor

As a reviewer,
I want to discard a weak option and see survivors redistribute — and at two shards be forced to Commit,
So that Eliminate never silently consumes the DeferReveal hero beat.

**Acceptance Criteria:**

**Given** shard count is greater than 2 and phase accepts `ELIMINATE`
**When** `ELIMINATE` is dispatched for a shard
**Then** phase runs `eliminating → redistributing → idle|hovering` with durations from MotionProfile (`eliminate-dissolve`, `redistribute`)
**And** the eliminated shard dissolves outward with lossless CSS `cut-flash`; survivors redistribute via CSS transform on shard groups (AD-22, UX-DR10, FR6)
**And** shard count decreases by one; there is no undo (FR6)
**And** input is locked for both `eliminating` and `redistributing` (AD-3)
**And** if the eliminated shard held focus, `focusedShardId` moves to the survivor at the same index clamped to last — never null while shards exist; DomView re-applies DOM focus after redistribute (AD-13)

**Given** shard count is exactly 2 (AD-12, UX-DR19)
**When** `ELIMINATE` is dispatched or mute preview is requested
**Then** the FSM refuses `ELIMINATE` and coerces `previewMode: mute` to `neutral`
**And** the rim offers no Mute highlight, no repulse cursor, and no `eliminate-cut` — Commit is the only exit
**And** the floor is enforced only in the FSM so both adapters inherit it

### Story 3.3: Pointer and keyboard resolve mappings

As a reviewer using pointer or keyboard,
I want rim-down to Eliminate and body-hold / Enter-Space-hold to Commit with the same progress,
So that both input paths share one FSM without click races or stuck holds.

**Acceptance Criteria:**

**Given** PointerAdapter is active (AD-23)
**When** `pointerdown` occurs on a **body** path
**Then** it sends `HOLD_START`, calls `setPointerCapture`, and the shard layer has `touch-action: none`
**When** `pointerdown` occurs on a **rim** path
**Then** it sends `ELIMINATE` (not `HOLD_START`)
**And** `pointerup` sends `HOLD_END`; `pointercancel` / `lostpointercapture` send `CANCEL`
**And** there is no `click` listener anywhere

**Given** KeyboardAdapter is active (AD-15, UX-DR14)
**When** `Enter` or `Space` is held (first keydown only — `event.repeat` ignored)
**Then** it sends `HOLD_START`; keyup sends `HOLD_END`; `Space` uses `preventDefault` to suppress scroll
**When** `Delete` or `Backspace` is pressed
**Then** it sends `ELIMINATE` unless phase is `pressing` (Eliminate refused during an in-progress hold)
**And** `blur` / `visibilitychange` send `CANCEL`
**And** DomView hold-progress serves both paths via `pressedShardId` (AD-8)

### Story 3.4: AudioPort multi-sensory tension and release

As a reviewer,
I want audible tension and release aligned to interaction phases without depending on audio to finish,
So that FR-8 multi-sensory feedback is present while remaining accessible if audio is blocked.

**Acceptance Criteria:**

**Given** `AudioPort` surface is exactly `bed-start`, `bed-stop-release`, `preview(mode, shardIndex)`, `eliminate-cut`, `commit-chord` (AD-11)
**When** the first activating intent (`HOLD_START` or `ELIMINATE`) arrives
**Then** the FSM emits `bed-start` — never from `PREVIEW_SET` / hover (autoplay gate)
**And** WebAudioPort creates/resumes the context lazily inside the port; while suspended it re-attempts resume on every subsequent cue (never latches permanent no-op)
**And** the FSM never learns whether audio is audible — no phase/lock depends on it
**And** cues are synthesised from oscillators/filters — no audio assets ship
**And** Commit path fires `commit-chord` aligned to DeferReveal; Eliminate fires `eliminate-cut`; preview cues reinforce Solo/Mute but are never the sole distinguishability channel (FR8, NFR4)
**And** emission order after a transition is: snapshot subscribers → AudioPort → EffectBus (AD-24)

### Story 3.5: Bounded EffectBus and ParticleEngine

As a reviewer spamming interaction during a recording,
I want particle garnish to drop under load without losing required beats or frame rate,
So that the demo stays smooth at ~60fps and SM-2 hero beats remain lossless elsewhere.

**Acceptance Criteria:**

**Given** `EffectBus` capacity 4 with drop-oldest (AD-9, FR9)
**When** the FSM publishes FX events
**Then** the bus carries only particle garnish for exactly three event types: `shard-eliminate`, `shard-commit`, `seam-flash`
**And** dissolve, seam brighten, magnetize, and `cut-flash` remain lossless CSS/DOM states; audio remains on AudioPort
**And** ambient sparks are generated inside ParticleEngine's internal emitter and never touch the bus (UX-DR4, AD-9)

**Given** ParticleEngine is subscribed to the bus
**When** the demo runs
**Then** it owns the **only** `requestAnimationFrame` loop; live particles capped at 400; burst count scales with intensity within the cap (AD-18, NFR1)
**And** FX canvas stays `pointer-events: none`
**And** all bus coordinates are canvas-local top-left CSS pixels (AD-22)
**And** under spam, oldest garnish drops and the demo remains responsive at ~60fps target (SM-3, FR9)

### Story 3.6: Core Vitest transition and lock suite

As a builder shipping a portfolio case study,
I want exhaustive unit tests on the pure core with a fake Clock,
So that every transition and input-lock window is proven platform-agnostic without DOM/E2E tests in v1.

**Acceptance Criteria:**

**Given** Vitest 4.1.10 configured against `src/core/` only (NFR5, Architecture Testing convention)
**When** the suite runs
**Then** `decision-node-fsm.test.ts` covers every phase transition in the Architecture state chart, including cancel paths and AD-12 eliminate refusal at two shards
**And** every input-lock window (`eliminating`, `redistributing`, `committing`) and terminal `solid` drop all intents including `CANCEL`
**And** `effect-bus.test.ts` proves capacity 4 drop-oldest and that only the three allowed event types are accepted
**And** `shard-geometry.test.ts` covers binary and radial 3–5 layouts (extends Story 1.4)
**And** tests drive time exclusively via an injected fake `Clock` — no real timers in core tests
**And** no DOM-based or E2E tests are added in v1
