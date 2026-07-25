---
title: Mind Void
status: draft
created: 2026-07-25
updated: 2026-07-25
source: _bmad-output/brainstorming/brainstorm-creative-todo-portfolio-2026-07-25/brainstorm-intent.md
---

# Product Brief: Mind Void

## Executive Summary

Mind Void is a **closure-first** productivity web experience built as a standout portfolio case study. It rejects the checkbox list as the primary metaphor. Open work appears as soft, pulsing charges in a serene spatial canvas — a “Mind Void” — because unfinished intention is treated as suspended mental energy, not a row in a database.

The product’s job is **peace of mind**: discharge open loops by acting, or by honestly resolving deferred decisions. The v1 demo centers on **DecisionNode** — cracked geometric shards that model analysis paralysis — so reviewers feel a system that tackles mental friction, not a visual reskin of TodoMVC.

**[ASSUMPTION]** Working name is **Mind Void** (taken from the session’s core UI metaphor). Rename freely if you prefer a different brand.

## The Problem

People don’t struggle because they lack lists. They struggle because unfinished intentions **occupy working memory**: noise in the background, promises to a future self, and decisions parked to relieve conscience now. Mainstream todo apps collapse all of that into the same checkbox object, so the UI never matches the real job — **closure**.

For a portfolio audience (hiring managers, design-aware engineers), another generic CRUD todo signals “tutorial app.” The opportunity is a product story that is instantly readable in a 60-second demo: *this person understands cognitive load and interaction craft.*

## The Solution

Mind Void presents open loops as **ChargeNodes** in a spatial **VoidCanvas**. Daily loops use abstract geometry; major checkpoints evolve into constellation-like shapes. Users **Drop** charges, **Discharge** them into luminous **ThreadArcs**, and **Seal** checkpoints into **Clarity Badges** that leave the void quiet again.

The v1 hero is **DecisionNode**: a ChargeNode that is a split or cracked polygon (2–N shards). Users **Eliminate** bad options or **Commit** a winner; the node fuses into a solid charge ready to discharge. Hover is zone-based DAW-style **Solo / Mute** preview (body vs rim) — no modifier keys — with tension/release audio and a hybrid DOM/SVG + Canvas FX layer.

## What Makes This Different

| Typical todo | Mind Void |
|---|---|
| List + checkbox | Mind Void + charges |
| One object type for everything | Noise / Promise / **Decision** (Decision is the demo) |
| Complete = check | Complete = discharge / decide / seal → clarity |
| Flat CRUD UI | Spatial geometry + multi-sensory feedback |
| Web toy or mobile clone | **Web-first**, FSM designed so mobile later only swaps InputAdapter |

Honest moat for this stage: **interaction and systems craft** for a portfolio case study — not a fabricated market lock-in. Differentiation is experiential and architectural (shared verbs, platform-agnostic FSM, performance-minded FX queue).

## Who This Serves

**Primary (v1):** Portfolio reviewers — hiring managers, senior engineers, design leads — evaluating craft in a short interactive demo.

**Secondary (product vision):** Knowledge workers who feel mental RAM drain from open loops and deferred decisions, and want closure more than streak metrics.

**[ASSUMPTION]** v1 success is measured by reviewer reaction and demo clarity, not retention/revenue.

## Success Criteria

- A cold reviewer can **discover Solo/Mute and Eliminate/Commit without a control guide**.
- DecisionNode fuse (DeferReveal / Commit) reads as the **hero story moment** in a short recording or live pass.
- Demo holds **smooth 60fps** under interaction spam (bounded FX queue, drop-oldest).
- Architecture story is explainable in one diagram: InputAdapter → FSM → DomView + EffectBus → ParticleEngine.
- Clear narrative: *closure > checkboxes*.

## Scope

### In — v1 portfolio demo (Web)

- VoidCanvas shell (DOM/SVG + Canvas overlay)
- DecisionNode (binary + multi-shard): Eliminate / Commit, zone Solo/Mute, FSM + Web InputAdapter
- EffectBus (capacity ~3–5, drop-oldest) + ParticleEngine for eliminate/commit/seam FX
- Micro-audio tension/release + cursor morph (attract / repulse)
- TypeScript contracts aligned with session sketches

### Out — v1

- Noise and Promise ChargeNode skins as build focus
- Full end-to-end Drop → Discharge → ThreadArc → Checkpoint Seal → ClarityBadge (defined as vision; not required for hero demo)
- Mobile app and device haptics
- Modifier-key controls
- Skill-tree / inventory metaphors not chosen for v1
- Accounts, sync, multiplayer, native install

## Vision

If it succeeds as a case study, Mind Void expands from DecisionNode into the full closure loop: discharge threads, constellation checkpoints, and clarity badges — then ports to mobile with the **same state machine**, only the input adapter changing. Longer term it can become a calm operating system for open loops: decide, act, seal, rest.

## Constraints & Architecture Notes

- **Web first → mobile later**; identical Eliminate/Commit verbs and component model.
- Three layers: InputAdapter | DecisionNodeFSM | DomView; FX via EffectBus (canvas never owns pointer).
- Sketches:  
  `_bmad-output/brainstorming/brainstorm-creative-todo-portfolio-2026-07-25/fx-architecture.sketch.ts`  
  `_bmad-output/brainstorming/brainstorm-creative-todo-portfolio-2026-07-25/decision-node.sketch.ts`

## Open Questions (from brainstorm)

- Exact DeferReveal / binary-split animation timing
- Final audio bed tuning
- Undo policy after Eliminate
- Sequencing of remaining primitives after the DecisionNode hero

---

*Draft produced via Fast path from brainstorm intent. Correct `[ASSUMPTION]` tags and rename as needed before PRD.*
