---
title: Mind Void
status: final
created: 2026-07-25
updated: 2026-07-25
theme: Emerald
theme_direction: dark-emerald-void
source: _bmad-output/planning-artifacts/briefs/brief-mind-void-2026-07-25/brief.md
---

# PRD: Mind Void

*Product name confirmed. Visual theme: **Emerald** (dark emerald void).*

## 0. Document Purpose

This PRD defines Mind Void v1 for downstream UX, architecture, and implementation. It is written for the builder (portfolio case study) and for any reviewer of the product contract. Vocabulary is Glossary-anchored; capabilities are grouped features with globally numbered FRs; assumptions are tagged inline and indexed in §9. This PRD builds on the Product Brief and brainstorm session; it does not duplicate architecture sketches — those live in `addendum.md` and the sketch sources.

**Inputs:**
- Product Brief: `_bmad-output/planning-artifacts/briefs/brief-mind-void-2026-07-25/brief.md`
- Brainstorm intent + sketches: `_bmad-output/brainstorming/brainstorm-creative-todo-portfolio-2026-07-25/`

## 1. Vision

**Mind Void** is a **closure-first** productivity web experience built as a standout portfolio case study. `[ASSUMPTION: product name remains Mind Void.]` Open work appears as soft, pulsing charges in a serene spatial canvas — the Mind Void — because unfinished intention is suspended mental energy, not a row in a database.

The product’s job is **peace of mind**: discharge open loops by acting, or by honestly resolving deferred decisions. v1 centers on **DecisionNode** — cracked geometric shards that model analysis paralysis — so a cold reviewer feels a system that tackles mental friction, not a visual reskin of TodoMVC. Daily loops may later use abstract geometry; major checkpoints may evolve into constellation-like shapes — vision language only until those primitives ship.

The atmosphere is **Emerald** — specifically a **dark emerald void**: cool, calm green depth that reads as quiet focus rather than a productivity dashboard. Differentiation is experiential and architectural craft for a portfolio audience — not a fabricated market lock-in. Narrative: *closure > checkboxes*.

`[ASSUMPTION: v1 success is reviewer reaction and demo clarity, not retention or revenue.]`

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** Resolve a parked decision (eliminate bad options / commit a winner) without a checkbox metaphor.
- **Emotional:** Feel tension release and clarity when a DecisionNode fuses — mental RAM freed.
- **Social (v1):** Signal interaction and systems craft to hiring managers, senior engineers, and design leads in ~60 seconds.
- **Contextual:** Web demo first; same verbs later on mobile via InputAdapter swap only. `[ASSUMPTION: mobile remains out of v1 build; only the adapter contract is designed for later.]`

### 2.2 Non-Users (v1)

- Teams needing sync, accounts, or multiplayer collaboration.
- Users seeking a full GTD / Zettel / project-management OS.
- Anyone expecting Noise/Promise ChargeNode skins or the full Drop → Seal loop as shippable v1.

### 2.3 Key User Journeys

- **UJ-1. Alex discovers DecisionNode without a guide.**
  - **Persona + context:** Alex, a hiring manager skimming a portfolio link between interviews.
  - **Entry state:** Lands on the web demo; VoidCanvas visible with at least one soft-pulsing cracked DecisionNode; no tutorial overlay required.
  - **Path:** Notices pulsing shards → hovers shard body (Solo / commit preview) → hovers rim (Mute / eliminate preview) → Eliminates a weak option → Commits a winner.
  - **Climax:** Fuse / DeferReveal reads as the hero moment; node becomes a Solid Charge.
  - **Resolution:** Void feels quieter; Alex understands “closure, not checkboxes.”
  - **Edge case:** Interaction spam during animation — input locked; FX stay bounded without jank.

- **UJ-2. Sam records the hero moment for a case-study clip.**
  - **Persona + context:** Sam, the builder, capturing a short recording for the portfolio write-up.
  - **Entry state:** Demo loaded; DecisionNode with 2+ shards ready.
  - **Path:** Performs Eliminate then Commit (or Commit path alone on binary) with audible tension → release.
  - **Climax:** Seam / fuse FX + Solid Charge are visually readable on recording.
  - **Resolution:** Clip supports architecture narrative: InputAdapter → FSM → DomView + EffectBus → ParticleEngine.

## 3. Glossary

- **Mind Void** — The product and the serene spatial field where open intention lives.
- **VoidCanvas** — The spatial shell (DOM/SVG + Canvas overlay) that hosts ChargeNodes.
- **ChargeNode** — A unit of suspended mental energy on the VoidCanvas. Family (vision): Noise, Promise, Decision — v1 ships **Decision** only.
- **DecisionNode** — A ChargeNode rendered as a cracked/split polygon (2–N shards) modeling analysis paralysis.
- **Shard** — One option fragment of a DecisionNode (≥2 required).
- **Eliminate** — Remove a Shard (outward dissolve); survivors redistribute. No undo in v1.
- **Commit** — Choose a winner Shard via hold-to-commit; centripetal fuse into a **Solid Charge**.
- **Solid Charge** — Resolved DecisionNode (discharge / ThreadArc later — vision, not v1).
- **Solo** — Zone preview on shard body: commit-oriented sensory preview.
- **Mute** — Zone preview on rim/close region: eliminate-oriented sensory preview.
- **DeferReveal** — The fuse / reveal payoff when Commit resolves the node (hero story moment).
- **EffectBus** — Bounded FX queue (capacity ~3–5, drop-oldest) feeding particle/flash effects.
- **Emerald theme** — Dark emerald void visual identity (calm green depth) across VoidCanvas and DecisionNode states.
- **InputAdapter** — Maps platform pointer/input to shared intents; Web adapter is v1.
- **DecisionNodeFSM** — Platform-agnostic state machine for DecisionNode interaction phases.

**Vision glossary (not v1 build):** Drop, Discharge, ThreadArc, Checkpoint Seal, Clarity Badge — full closure loop after DecisionNode hero.

## 4. Features

### 4.1 VoidCanvas Shell

**Description:** The demo surface is a spatial VoidCanvas under the Emerald theme. Open mental load appears as soft-pulsing ChargeNodes in a calm field — not a list. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-1: Present VoidCanvas

A reviewer can open the web demo and see a spatial VoidCanvas hosting at least one DecisionNode. Realizes UJ-1.

**Consequences (testable):**
- No primary checkbox-list layout is shown as the default metaphor.
- VoidCanvas is interactive on web without an account gate.
- Idle DecisionNode Shards show a soft pulse (suspended-energy presence), not a static flat shape.

#### FR-2: Apply Emerald theme

The demo presents a coherent dark-emerald-void atmosphere (calm green depth, serene focus) across VoidCanvas background and DecisionNode states. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Theme direction is dark emerald void (not bright jade / neon gaming green).
- Once UX locks tokens, those tokens are applied consistently across VoidCanvas and DecisionNode states.
- State changes (hover Solo/Mute, Eliminate, Commit) remain legible under Emerald tinting.

`[ASSUMPTION: exact hex/gradients deferred to UX; direction locked = dark emerald void.]`

### 4.2 DecisionNode — Discover & Preview

**Description:** DecisionNode is the v1 hero: a cracked polygon of Shards. Zone-based Solo/Mute previews (no modifier keys) teach Eliminate vs Commit. Realizes UJ-1.

**Functional Requirements:**

#### FR-3: Render DecisionNode shards

The system presents a DecisionNode as 2+ Shards (binary halves or multi-shard). Realizes UJ-1.

**Consequences (testable):**
- A DecisionNode with fewer than 2 Shards cannot enter resolution.
- Binary and multi-shard (≥3) configurations are both supported in v1.

#### FR-4: Zone Solo preview

On pointer hover over a Shard body, the system enters Solo preview (commit-oriented sensory feedback). Realizes UJ-1.

**Consequences (testable):**
- Solo does not require keyboard modifiers.
- Solo is distinguishable from Mute on **at least two channels simultaneously**: (1) visual zone highlight on the shard body, and (2) cursor morph toward attract (commit). Audio preview may reinforce but is not sufficient alone.

#### FR-5: Zone Mute preview

On pointer hover over the rim/close zone, the system enters Mute preview (eliminate-oriented sensory feedback). Realizes UJ-1.

**Consequences (testable):**
- Mute does not require keyboard modifiers.
- Mute is distinguishable from Solo on **at least two channels simultaneously**: (1) visual zone highlight on the rim/close region, and (2) cursor morph toward repulse (eliminate). Audio preview may reinforce but is not sufficient alone.
- Cold reviewers can discover Mute without a control guide within ~60 seconds of first interaction. Validates SM-1.

### 4.3 DecisionNode — Resolve

**Description:** Eliminate removes bad options; Commit fuses a winner into a Solid Charge. DeferReveal is the hero payoff. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-6: Eliminate a Shard

The reviewer can Eliminate a Shard; it dissolves outward and remaining Shards redistribute. Realizes UJ-1.

**Consequences (testable):**
- After Eliminate, Shard count decreases by one.
- Input is locked during the eliminate animation.
- There is **no undo** after Eliminate in v1.

#### FR-7: Commit a winner

The reviewer can Commit a Shard via **hold-to-commit** (~400ms; cancel if pointer leaves the shard before threshold). The node fuses into a Solid Charge (DeferReveal). Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Hold duration target is ~400ms; leaving the shard before threshold cancels Commit.
- Commit produces a Solid Charge (cracks gone).
- Input is locked during the commit animation.
- Fuse/DeferReveal is visually readable as the hero moment and meets the UX timing/visibility checklist once Open Question #1 is resolved. Validates SM-2.

#### FR-8: Multi-sensory tension and release

During Solo/Mute and Eliminate/Commit, the system **must** provide micro-audio tension/release and cursor morph (attract vs repulse) aligned to the action. Realizes UJ-1, UJ-2.

**Consequences (testable):**
- Audio cues **start and stop** with interaction phases (not optional capability language).
- The Commit path **includes** an audible release aligned to DeferReveal (final tones deferred to UX tuning).
- Cursor state reflects attract (commit) vs repulse (eliminate) intent.

`[ASSUMPTION: final audio bed tuning deferred; presence and phase-alignment of tension/release are required.]`

### 4.4 Bounded FX

**Description:** Eliminate/Commit/seam effects run through a bounded EffectBus so spam cannot destroy frame rate. Realizes UJ-1 edge case, UJ-2.

**Functional Requirements:**

#### FR-9: Bounded EffectBus

Visual FX for eliminate, commit, and seam events enqueue on a capacity-limited bus (~3–5); when full, oldest drops. Realizes UJ-1.

**Consequences (testable):**
- Under interaction spam, demo remains responsive at ~60fps target. Validates SM-3.
- Canvas overlay does not own pointer hit-testing (`pointer-events` none on FX canvas).

## 5. Non-Goals (Explicit)

- Not a TodoMVC / checkbox-list product.
- Not a full GTD, Zettelkasten, or team PM suite.
- Not clinical wellness, ADHD treatment, or scientifically validated focus therapy.
- Not accounts, sync, multiplayer, or native install in v1.
- Not mobile app / haptics in v1 (adapter contract may anticipate later).
- Not Noise or Promise ChargeNode skins as v1 build focus (family reserved in Glossary as vision).
- Not the full Drop → Discharge → ThreadArc → Checkpoint Seal → Clarity Badge loop as required v1 scope (vision only).
- Not modifier-key Solo/Mute.
- Not skill-tree / inventory metaphors.
- Not undo after Eliminate in v1.

## 6. MVP Scope

### 6.1 In Scope

- VoidCanvas shell (DOM/SVG + Canvas overlay) with dark Emerald theme and idle soft pulse
- DecisionNode (binary + multi-shard): Solo/Mute (≥2 cue channels), Eliminate/Commit (hold ~400ms), Solid Charge
- EffectBus + particle/seam FX (bounded)
- Required micro-audio tension/release + cursor morph
- Web InputAdapter + DecisionNodeFSM contracts aligned with session sketches
- Portfolio-demo readiness (cold discovery ≤~60s, recordable hero moment)

### 6.2 Out of Scope for MVP

- Noise / Promise skins — deferred post-hero
- Full closure loop (Drop → Seal → Clarity Badge) — vision / later
- Mobile app + haptics — later via InputAdapter
- Undo after Eliminate — explicitly excluded for v1
- Accounts / sync / multiplayer / PWA install

## 7. Success Metrics

`[ASSUMPTION: v1 success = reviewer reaction and demo clarity, not retention/revenue.]`

**Primary**

- **SM-1**: Cold-discoverability — Within ~60 seconds of first interaction, a reviewer without a control guide can perform Solo/Mute and Eliminate/Commit. Validates FR-4, FR-5, FR-6, FR-7.
- **SM-2**: Hero readability — DecisionNode fuse (DeferReveal / Commit) is identifiable as the story climax in a live pass or short recording (visual + audible release). Validates FR-7, FR-8.
- **SM-3**: Performance under spam — Interaction remains smooth at ~60fps with EffectBus drop-oldest behavior. Validates FR-9.

**Secondary**

- **SM-4**: Architecture story — Builder can explain the system in one diagram: InputAdapter → FSM → DomView + EffectBus → ParticleEngine.
- **SM-5**: Narrative clarity — Reviewer leave-behind is *closure > checkboxes*, not “pretty todo.”

**Counter-metrics (do not optimize)**

- **SM-C1**: Feature count / CRUD completeness — Do not expand scope to “look like a real todo app.”
- **SM-C2**: Retention / DAU / revenue — Out of scope for v1 portfolio demo.
- **SM-C3**: Maximum FX spectacle — Do not prioritize particle density over discoverability or frame budget.

## 8. Open Questions

1. Exact DeferReveal / binary-split animation timing and visual spec (UX) — owner: UX; revisit at `bmad-ux`.
2. Final audio bed tones and transitions — owner: UX; presence already required by FR-8.
3. Sequencing of remaining primitives after DecisionNode hero (Noise, Promise, full loop) — owner: PM/builder; revisit after hero demo ships.
4. Emerald token values (hex, gradients, glow discipline) under dark-emerald-void direction — owner: UX.

*Resolved during Finalize:* product name = Mind Void; no undo after Eliminate; Emerald direction = dark emerald void; UJ-1/UJ-2 accepted.

## 9. Assumptions Index

- `[ASSUMPTION]` Product name remains Mind Void (§1).
- `[ASSUMPTION]` v1 success = reviewer demo clarity, not retention/revenue (§1, §7).
- `[ASSUMPTION]` Mobile out of v1 build; adapter designed for later swap only (§2.1).
- `[ASSUMPTION]` Exact Emerald hex/tokens deferred to UX; direction = dark emerald void (FR-2).
- `[ASSUMPTION]` Final audio bed tuning deferred; phase-aligned tension/release required (FR-8).
- `[ASSUMPTION]` EffectBus capacity ~3–5 (sketch default ~4) (FR-9).

## 10. Traceability (lightweight)

| Source | Landed in |
|---|---|
| Product Brief — problem/solution/scope | §1, §4–§6 |
| Product Brief — success criteria | §7 |
| Product Brief — charge family / closure verbs / pulse | Glossary, FR-1, vision stubs |
| Builder decision — Emerald / dark void / no undo / name | FR-2, FR-6, frontmatter, §8 resolved |
| Architecture sketches | `addendum.md` |
| Landscape research | §5 positioning; avoid over-claims |
| Finalize rubric fixes | FR-4, FR-5, FR-7, FR-8 |
