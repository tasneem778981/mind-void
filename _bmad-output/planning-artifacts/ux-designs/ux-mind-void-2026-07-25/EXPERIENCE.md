---
name: Mind Void
status: final
updated: 2026-07-25
sources:
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/prd.md
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/addendum.md
---

# Mind Void — Experience Spine

Visual identity lives in `DESIGN.md`; token references use `{path.to.token}`. Both spines win on conflict with any mock.

## Foundation

Single-surface **web**, pointer-first, desktop-primary. No UI system — every element is bespoke DOM/SVG over a transparent FX canvas. No accounts, no routing, no persistence: a cold load always presents a fresh unresolved DecisionNode.

Dark is the only mode. There is no light theme and no theme toggle — the void is the product.

The interactive object is a **ChargeNode**. v1 renders exactly one kind — **DecisionNode** — and the Noise and Promise kinds stay unbuilt (PRD non-goal). The patterns below are written against DecisionNode specifically; the ChargeNode vocabulary is preserved so future skins slot in without renaming the family.

`[ASSUMPTION]` Desktop-primary because Solo/Mute are hover zones. The coarse-pointer row in State Patterns is a graceful-degradation floor for someone opening the portfolio link on a phone — it is not the mobile product, which the PRD reserves for a later InputAdapter swap.

→ Visual reference: `mockups/void.html`. The spines win on conflict.

## Information Architecture

| Surface | Reached from | Purpose |
|---|---|---|
| Void | Page load (only surface) | Hosts a single centered DecisionNode; the entire interaction lives here |

Zones within Void:

| Zone | Location | Purpose |
|---|---|---|
| Shard body | Interior of each shard polygon | Solo preview → Commit |
| Rim band | `{spacing.rim-band}` inset along shard perimeter | Mute preview → Eliminate |
| Hint line | Bottom-center | One-sentence orientation at cold load |
| Architecture credit | Bottom-right | Systems note for the portfolio reader |

No navigation, no modals, no overlays. Every stated PRD need lands on Void.

## Voice and Tone

Microcopy only; brand voice lives in `DESIGN.md.Brand & Style`. Text must never explain the controls — the interaction teaches itself (SM-1).

| Do | Don't |
|---|---|
| `something here is unresolved.` | `Click a shard to choose!` |
| `closure, not checkboxes.` | `Great job! Task complete 🎉` |
| `InputAdapter → FSM → DomView + EffectBus → ParticleEngine` | `Built with React and Canvas` |
| Lowercase, terminal punctuation, no exclamation marks | Tooltips, coach marks, control legends |

**Fixed strings.** These are the only words in the product:

| Slot | String | When |
|---|---|---|
| Hint line | `something here is unresolved.` | Cold load; fades on first Commit |
| Thesis line | `closure, not checkboxes.` | Replaces the hint line for ~4s after the first Commit, then fades. Carries SM-5. |
| Architecture credit | `InputAdapter → FSM → DomView + EffectBus → ParticleEngine` | Always, bottom-right |

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| DecisionNode | Void | 2–5 shards (`DESIGN.md.Components` sets 5 as the cracked-read ceiling). Binary uses a single seam; 3+ radiate from center. Cannot enter resolution below 2 shards. Owns the FSM instance. |
| Shard | Inside DecisionNode | Pointer over body → Solo. Pointer over rim band → Mute. Zones are mutually exclusive; rim wins on overlap. |
| Rim band | Shard perimeter | Click → Eliminate. Not a visible control at rest. |
| Hold progress | Shard perimeter, during press | Fills over `{motion.hold-commit}`. Pointer leaving the shard before completion cancels and rewinds. |
| Solid Charge | Replaces DecisionNode after Commit | Terminal in v1. No further affordance — it stops pulsing and stops inviting. |
| FX layer | Full-canvas overlay | `pointer-events: none`. Never hit-tested, never a surface. |
| Hint line | Bottom-center | Visible at cold load. Fades permanently on first Commit. |

## State Patterns

| State | Trigger | Treatment |
|---|---|---|
| Idle | Cold load, or pointer leaves node | Exactly one DecisionNode, centered. Shards at `{colors.shard-face}`, opacity pulse toward `{colors.charge-pulse}` on `{motion.pulse-idle}` with `{motion.ease-calm}`. Sparse `{colors.ambient-spark}` drift across the field. Ambient audio bed at low level. |
| Solo preview | Pointer enters shard body | Face → `{colors.shard-face-solo}` + glow, cursor → attract, audio → consonant preview tone. All three in over `{motion.preview-in}`. |
| Mute preview | Pointer enters rim band | Face → `{colors.shard-face-mute}`, edge → `{colors.repulse-edge}`, glow off, cursor → repulse, audio → detuned preview tone. |
| Pressing | Pointer down on shard body | Hold progress fills. Leaving the shard rewinds over `{motion.preview-out}` and returns to Idle. |
| Eliminating | Click on rim band | Shard dissolves outward over `{motion.eliminate-dissolve}`, `{colors.cut-flash}` one-frame flash, survivors redistribute over `{motion.redistribute}` with `{motion.ease-calm}`. Audio fires the **eliminate-cut** port — a short filtered transient, no tail. **Input locked** for the full sequence. No undo. |
| Committing | Hold completes | Shards magnetize inward over `{motion.fuse-magnetize}` with `{motion.ease-magnetize}`, seam brightens to `{colors.charge-glow}` for `{motion.seam-flash}`, solid settles over `{motion.solid-settle}` with a slight overshoot. Audio fires the **commit-chord** port. **Input locked.** This is DeferReveal — the hero beat. |
| Solid | Commit resolves | `{colors.solid-face}` + halo, pulse stops, audio bed resolves to a held chord then decays to silence. |
| Spam | Rapid repeated input | Input lock absorbs it; FX beyond EffectBus capacity (~4) drop oldest. Frame budget wins over completeness. |
| Audio blocked | Autoplay policy before first gesture | Bed stays silent, no banner. Bed starts on the first pointer interaction. Visual channels alone must still satisfy Solo/Mute distinguishability. |
| Reduced motion | `prefers-reduced-motion: reduce` | Pulse and ambient drift off. Eliminate and Commit resolve in a single 120ms cross-fade — the state change still happens, the travel does not. **Trade-off:** this deliberately sacrifices the DeferReveal spectacle that SM-2 measures. The seam flash and the audible release are retained, so the beat is still *marked*; it is no longer cinematic. Recordings for the case study must be captured with motion enabled. |
| Touch / coarse pointer | `pointer: coarse` | No hover, so no preview state. Tap shard body = Commit (hold still applies), tap rim = Eliminate. A degradation floor for a phone visitor, not the mobile product. |

## Interaction Primitives

- **Hover** teaches. Solo and Mute are discoverable purely by moving the pointer across a shard.
- **Hold** commits (`{motion.hold-commit}`), with visible progress and free cancellation by leaving the shard.
- **Click** on the rim eliminates — immediate, irreversible.
- Two channels always fire together for each preview: **visual zone treatment + cursor morph**. Audio reinforces but is never the sole signal (PRD FR-4 / FR-5).
- **Banned:** modifier keys, right-click menus, drag-to-reorder, tooltips, coach marks, onboarding overlays, confirmation dialogs.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md`.

- Ink Primary on Void Base clears 4.5:1; Ink Faint is decorative-only and never carries required meaning.
- Reduced motion is honored per State Patterns — the demo remains fully completable without travel animation.
- Audio is never required to complete an action; every audio cue has a visual twin.

**Keyboard floor.** A hover-and-hold product has no natural keyboard equivalent, so the demo defines one rather than shipping without:

| Key | Effect | Notes |
|---|---|---|
| `Tab` / `Shift+Tab` | Move focus between shards of the DecisionNode | Focus ring in `{colors.focus-ring}`, never `{colors.charge-glow}` — that colour means Commit |
| `Enter` or `Space` (held) | Commit the focused shard | Same `{motion.hold-commit}` duration and the same perimeter progress indicator as the pointer path; releasing early cancels and rewinds |
| `Delete` or `Backspace` | Eliminate the focused shard | Immediate and irreversible, matching the rim click |

Focus is not a preview: a focused shard shows the focus ring only, not the Solo treatment. This keeps the ring from being read as a commit hint. Modifier keys remain banned (PRD non-goal) — every keyboard action is a bare key.

## Key Flows

### UJ-1 — Alex discovers DecisionNode without a guide

1. Alex opens the portfolio link. Void loads with one cracked DecisionNode pulsing at center; the hint line reads `something here is unresolved.`
2. Pointer crosses a shard body — face lifts, glow appears, cursor pulls inward. Solo.
3. Pointer drifts to the shard edge — face drains, edge goes cold, cursor pushes away. Mute. The contrast between the two teaches the verbs without text.
4. Alex clicks the rim of the weakest option. It dissolves outward; the survivors redistribute to fill the gap.
5. Alex presses and holds a remaining shard. Progress fills along its perimeter.
6. **Climax (DeferReveal):** shards magnetize inward, the seam flashes, and the node lands as a single Solid Charge — still, quiet, no longer pulsing. The audio bed resolves and decays.
7. The hint line gives way to `closure, not checkboxes.` for a few seconds, then fades. The void is quiet.

Failure path: Alex releases the hold early — progress rewinds, node returns to Idle, nothing is lost.

### UJ-2 — Sam records the hero moment for the case study

1. Sam loads the demo with a multi-shard DecisionNode.
2. Eliminates two options in sequence, letting each redistribute settle before the next.
3. Holds the winner; progress is visible on camera.
4. **Climax:** DeferReveal fires with seam flash and audible release — readable at recording frame rates and on a muted autoplay loop, because the visual beat carries alone.
5. Bottom-right architecture credit stays in frame for the closing still.

Failure path: FX queue saturates during rapid capture — oldest effects drop, frame rate holds, the hero beat still renders.

## Open Items

Non-blocking; none prevents implementation starting.

1. Final audio bed tuning: bed pitch, preview interval, commit chord voicing. Presence and phase-alignment are already required by PRD FR-8, so this is a tuning pass, not a design gap. *Owner: UX, during build.*
2. Should coarse pointers get a tap-to-preview intermediate state, or is the current degradation floor enough? *Owner: UX, revisit if the demo gets meaningful mobile traffic.*
3. Shard-count ceiling of 5 is a UX judgment against the PRD's "2–N". *Owner: builder, confirm at first multi-shard build.*

**Resolved at finalize:** keyboard floor adopted (see Accessibility Floor) · cold load seeds exactly one DecisionNode · reduced-motion trade-off accepted and documented.
