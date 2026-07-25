# Brainstorm Intent — Creative To-Do Portfolio

**Session:** 2026-07-25 · **Status:** Handoff to product brief  
**Artifacts:** `fx-architecture.sketch.ts`, `decision-node.sketch.ts`

---

## Product Thesis

A **closure-first** to-do experience—not lists or checkboxes, but relief from suspended mental energy.

- At bedrock, a todo is the **gap between current reality and desired reality**: a contract of intention to act, often a **deferred decision** parked to quiet conscience now.
- Unfinished items are **charges awaiting discharge**—background noise draining RAM until resolved.
- The product sells **peace of mind through deciding or moving A → B**, not task completion metrics.
- UI metaphor: a **Mind Void** where open work appears as soft pulsing nodes (mental load), not rows.

---

## Target

**Portfolio case study** — first project must stand out from generic todo apps.

- Hero proof point: **DecisionNode** (multi-shard decision resolution) demonstrates system depth, not UI reskin.
- **DeferReveal** fuse animation flagged as a key reviewer story moment (visual distinction for analysis-paralysis → resolved charge).

---

## Form Factor

| Phase | Platform |
|-------|----------|
| **v1 demo** | **Web app first** — hybrid DOM/SVG + Canvas overlay |
| **Later** | Mobile — same FSM/component model; swap **InputAdapter** only |

Platform-agnostic core: identical state machine and component architecture; web uses pointer events, micro-audio, and cursor morph instead of device haptics.

---

## Core Metaphors & Primitives

### Visual language

- **Daily loops:** abstract geometry.
- **Major checkpoints / long-term milestones:** natural / constellation shapes.

### Five primitives

| Primitive | Role |
|-----------|------|
| **VoidCanvas** | Shell owning space sync, DOM/SVG layers, Canvas FX layer |
| **ChargeNode** | Active mental load unit — variants: Noise, Promise, **Decision** (hero) |
| **ThreadArc** | Connection between nodes (neon laser thread on discharge) |
| **CheckpointShape** | Milestone polygon that seals and docks |
| **ClarityBadgeDock** | Completed checkpoint badge; void resets fresh |

### Core interactions

| Verb | Meaning |
|------|---------|
| **Drop** | Add charge — spring drop + ripple |
| **Discharge** | Resolve charge — long-press/swipe Glow Pulse, thread to prior node, collective luminosity rises |
| **DeferReveal** | Decision fuse animation (hero moment for Decision variant) |
| **Seal** | Checkpoint close — polygon shimmer, particles, clarity wave, fog clears |

### Broader Mind Void behaviors (context, not v1 hero)

- Add = spring drop + ripple.
- Checkpoint close = polygon fills, particles, clarity wave; shape docks as Clarity Badge.
- Multi-sensory on mobile (later): haptic clicks on thread connect, release pulse on checkpoint; ascending harmonic tones resolve to chord on close.

---

## DecisionNode — Portfolio Hero Mechanics

**Chosen over Noise and Promise skins** for demo priority.

### Visual model

- **Binary:** two semicircle halves offset ~8–12px on a hairline fault; desynced pulse; cool/warm tint mismatch.
- **Multi-shard (3+):** cracked polygon (triangle / square / hex)—choice options floating slightly apart; models analysis paralysis, not only binary split.
- **Resolve payoff:** halves/shards magnetize or collapse → fault seals with micro-flash → **solid ChargeNode**, sync lock, ready for **Discharge**.

### Two physics modes (same verbs, same component)

| Verb | Physics | Web input |
|------|---------|-----------|
| **Eliminate** | Outward impulse + opacity/scale dissolve; survivors spring-redistribute into simpler polygon | Quick click on close affordance, or swift drag-out |
| **Commit** | Centripetal magnetize into winner; elastic overshoot; losers stretch then merge; mass/luminosity conserved into one ChargeNode | Click-and-hold on winner (~400ms), or drag shards into each other |

Reused for binary and multi-shard nodes—one component architecture.

### Solo / Mute preview zones (DAW-inspired)

**Zone-based only** — no modifier keys (discoverability).

| Zone | Preview | Effect |
|------|---------|--------|
| **Shard body** | **Solo** | Commit preview — others dim; partial harmonic emphasis |
| **Outer rim / close** | **Mute** | Eliminate preview — soft ghost before confirm; shard ducked |

While DecisionNode is open: dissonant desync **audio bed**; on Commit/Eliminate → release to consonant chord.

### FSM phases

`idle` → `hovering` → `pressing` → `dragging` → `eliminating` | `committing` → `solid`

- Only **Eliminate** and **Commit** intents enter resolution transitions.
- Input locked during eliminate/commit animations.

### Three-layer architecture

```
InputAdapter (web pointer → intents)
    → DecisionNodeFSM (platform-agnostic)
    → DomView (CSS vars + data-state; SVG/DOM hit targets)
    → EffectBus → ParticleEngine (Canvas; never reads pointer)
```

---

## Sensory & FX Architecture Decisions

### Rendering stack (day 1)

- **DOM/SVG:** vector geometry, layout, hit targets, a11y, pointer-events.
- **Canvas overlay:** particles, seam flashes, ambient dust/sparks — no DOM re-renders on FX.
- **Decoupled Event Bridge:** FSM emits lightweight FX events (coords, direction); DOM untouched.

### Pipeline

```
InputAdapter → DecisionFSM → EffectBus(FX events) → ParticleEngine
```

- Shared **VoidCanvas local coords** via `getBoundingClientRect` once per frame when dirty.
- Canvas `pointer-events: none` — hit-testing stays on DOM/SVG.

### EffectBus

- Bounded **drop-oldest** queue; capacity **~3–5 bursts** (sketch default: 4) for 60/120fps frame-budget safety.
- FX event types: `shard-eliminate`, `shard-commit`, `seam-flash`, `seal-burst`, `ambient-spark`.

### Web sensory (replaces haptics)

- Micro-audio cues: bed start/stop, preview solo/mute, eliminate cut, commit chord.
- **Cursor morph** via CSS data attribute: attraction (solo/overlap) vs repulsion (mute/drag-out).

---

## Out of Scope — v1 Demo

- **Noise and Promise** ChargeNode skins (DecisionNode is the demo hero).
- **Mobile** builds and device haptics.
- **Modifier-key** Solo/Mute (zone-based only).
- Full Mind Void loop end-to-end (Drop, Discharge, ThreadArc, CheckpointShape, ClarityBadgeDock) — context defined; **DecisionNode resolution flow is the build focus**.
- Game-stolen patterns explored but not chosen for v1: skill-tree branch greying, inventory drag/equip ghost silhouette.

---

## Open Questions

- **DeferReveal** fuse animation — flagged as hero story moment; visual spec and transition logic not fully defined in session.
- **Binary split** transform — high-level direction (offset halves, fault seal, micro-flash); detailed animation timing/spec TBD.
- **Audio dissonance bed** — structure outlined (desync while open, solo/mute ducking, chord on release); exact tones/transitions not locked.
- **Undo** — game cross-pollination raised "grey branch until undo"; no decision taken.
- **Remaining primitives** (ThreadArc discharge, Checkpoint Seal, ClarityBadge dock) — named and contextualized; scope and sequencing for post-hero work undefined.
- **FSM/Adapter final lock** — TypeScript sketches exist; session ended at handoff before production implementation lock.

---

## Chosen Direction (Summary)

Closure-first **Mind Void** product concept. **DecisionNode** (multi-shard Eliminate/Commit + zone Solo/Mute) is the portfolio hero. **Web-first** hybrid DOM/SVG + Canvas. **EffectBus** drop-oldest FX pipeline. Sketches capture VoidCanvas/EffectBus/ParticleEngine and DecisionNodeFSM/WebInputAdapter contracts.
