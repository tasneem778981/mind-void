# Addendum: Mind Void PRD

Companion to `prd.md`. Holds mechanism depth, rejected alternatives, and research notes that must not inflate the PRD’s capability narrative.

## Architecture invariants (from session sketches)

Sources:
- `_bmad-output/brainstorming/brainstorm-creative-todo-portfolio-2026-07-25/fx-architecture.sketch.ts`
- `_bmad-output/brainstorming/brainstorm-creative-todo-portfolio-2026-07-25/decision-node.sketch.ts`

**Layers**
- `InputAdapter` (Web v1) → `DecisionNodeFSM` (platform-agnostic) → `DomView` (CSS vars / data-state)
- FX: FSM publishes to `EffectBus` → `ParticleEngine`; canvas never owns pointer; canvas `pointer-events: none`
- Hit-testing on DOM/SVG; coords in VoidCanvas local space; dirty + `getBoundingClientRect` sync

**DecisionNodeFSM phases (sketch)**
`idle` → `hovering` → `pressing` → `dragging` → `eliminating` | `committing` → `solid`

**FX event types (sketch)**
shard-eliminate, shard-commit, seam-flash, seal-burst, ambient-spark

**Sensory ports (Web)**
bed-start/stop, preview solo/mute, eliminate-cut, commit-chord; cursor via data attribute (attract / repulse)

**Defaults from sketches (implementation priors, not PRD claims)**
- EffectBus capacity default ~4 (PRD allows ~3–5)
- Hold-to-commit ~400ms
- DecisionNode requires ≥2 shards

Sketches are design artifacts until production-locked in architecture / implementation.

## Emerald theme (direction lock)

**Decision (2026-07-25):** Theme = Emerald → **dark emerald void** (not bright jade).

PRD locks brand direction only. Token work (hex, gradients, glow discipline) belongs in UX (`bmad-ux`). Avoid purple-default / cream-serif / broadsheet clichés; Emerald should read as calm depth, not neon gaming green.

## Charge family & closure loop (vision stubs)

- ChargeNode family: Noise | Promise | Decision — only Decision ships in v1.
- Full loop verbs (vision): Drop → Discharge → ThreadArc → Checkpoint Seal → Clarity Badge.
- Geometric evolution / constellation checkpoints: product vision language; not v1 FRs.

## Landscape digest (Discovery research)

Spatial canvases (Kinopio, Heptabase, AFFiNE, etc.) organize thinking by layout; few make *decide* the primary verb. Decision apps (DecideOnce, DecisionTimeout, Whym) attack paralysis with settle/lock/timers — usually form/list UX. Portfolio demos win via interaction craft. Calm/focus brands sell state change, not list completeness. Open-loop discourse cites Zeigarnik + GTD externalization.

**Fit:** Closure-first demo; DecisionNode vs checkbox; honest portfolio case study; calm adjacent without clinical claims.

**Do not claim:** Full GTD/Zettel OS; clinical validation; uniqueness merely for being “spatial”; shipped sync/collab unless built.

## Options considered / deferred

| Topic | Chosen (v1) | Deferred / rejected |
|---|---|---|
| Hero metaphor | DecisionNode (cracked shards) | Noise/Promise skins as build focus |
| Input | Zone Solo/Mute, no modifiers | Modifier-key controls |
| Platform | Web first | Mobile app + haptics |
| Scope loop | Resolve to Solid Charge | Full Drop→Seal→ClarityBadge |
| Moat story | Craft + architecture | Fabricated market lock-in |
| Theme | Emerald | (prior unset; now locked) |

## Open mechanism questions (for UX / architecture)

- DeferReveal / binary-split timing curves
- Audio bed final tuning
- Undo after Eliminate
- Production lock of FSM/Adapter APIs from sketches
