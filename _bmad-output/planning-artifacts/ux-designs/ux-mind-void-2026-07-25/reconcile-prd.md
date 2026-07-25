---
title: PRD ↔ UX Reconciliation — Mind Void
status: review
created: 2026-07-25
verdict: minor gaps
sources:
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/prd.md
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/addendum.md
  - _bmad-output/planning-artifacts/ux-designs/ux-mind-void-2026-07-25/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-mind-void-2026-07-25/EXPERIENCE.md
---

# PRD ↔ UX Reconciliation — Mind Void

**Verdict: minor gaps.** Every FR-1..FR-9 has real coverage in at least one spine, and all `{path.to.token}` references in `EXPERIENCE.md` resolve against `DESIGN.md` frontmatter. The gaps are (a) one required FR-8 sensory channel with no visual/behavioral spec (cursor morph has no token, Eliminate has no audio cue), (b) PRD Open Question #1's *binary-split* half left unaddressed, and (c) several PRD/addendum qualitative ideas — charge family, closure-loop verbs, the anti-cliché guardrails, the explicit *closure > checkboxes* thesis string — dropped without a stub.

---

## 1. FR Coverage Matrix

| FR | Behavioral (EXPERIENCE) | Visual (DESIGN) | Verdict |
|---|---|---|---|
| **FR-1** Present VoidCanvas | Foundation (single web surface, cold load = fresh unresolved DecisionNode, no accounts/routing); IA table (Void as only surface); Idle state = shards + opacity pulse; UJ-1 step 1 | Brand & Style ("the canvas *is* the product", no header/toolbar/cards); `components.void-canvas` + vignette; Shard idle opacity pulse | **Covered** |
| **FR-2** Apply Emerald theme | Foundation ("Dark is the only mode… no theme toggle") | Full `colors` block, Brand & Style, Colors rationale, Do's/Don'ts banning neon green and multi-hue coding; every state token drawn from one hue family + one cold outlier | **Covered** |
| **FR-3** Render 2+ shards | Component Patterns: "2–N shards. Cannot enter resolution below 2 shards."; UJ-2 uses a multi-shard node | Shapes (hard-corner polygons, 1px seam as "absence of material") | **Covered, thin** — see Gap G3: binary (2-shard) split has no distinct visual/motion spec, so PRD FR-3 consequence "binary and multi-shard both supported" is asserted but not specified |
| **FR-4** Zone Solo preview | Solo preview state (face + glow + attract cursor + consonant tone, all over `preview-in`); Interaction Primitives ("two channels always fire together: visual zone treatment + cursor morph"); modifier keys explicitly banned | `shard-solo` component (`shard-face-solo` + `0 0 24px charge-glow`), "Paired with the attract cursor; the two channels always fire together" | **Covered** (cursor channel under-specified — Gap G1) |
| **FR-5** Zone Mute preview | Mute preview state (face drains, edge → `repulse-edge`, glow off, repulse cursor, detuned tone); Zones "mutually exclusive; rim wins on overlap"; hover-teaches primitive serving SM-1 | `shard-mute` + `rim-zone` components; Colors rationale ("elimination reads as *draining*, never as an error"); Don't: "Mute = red, X icon, or strikethrough" | **Covered** (cursor channel under-specified — Gap G1) |
| **FR-6** Eliminate a Shard | Eliminating state: dissolve outward over `eliminate-dissolve`, `cut-flash` one-frame flash, redistribute over `redistribute`, **input locked**, **no undo**; Rim band click → Eliminate; UJ-1 step 4 | `cut-flash` colour (pale, cold, "never used as a fill"); motion `eliminate-dissolve` / `redistribute` | **Covered** (no audio cue — Gap G2) |
| **FR-7** Commit a winner | Hold progress fills over `hold-commit`, pointer leaving shard cancels **and rewinds** over `preview-out`; Committing state = magnetize + seam flash + solid settle with overshoot, input locked, named DeferReveal; Solid = pulse stops; UJ-1 step 6, UJ-2 step 4 | `hold-progress` component bound to `motion.hold-commit`; `solid-charge` (no seam, no pulse); "Stillness as the reward" Do; full `fuse-magnetize` / `seam-flash` / `solid-settle` motion set | **Covered** — resolves PRD Open Question #1 for the DeferReveal half |
| **FR-8** Multi-sensory tension/release | Ambient bed at Idle; consonant/detuned preview tones; bed "resolves to a held chord then decays to silence" at Solid; cursor attract/repulse on both previews; Audio-blocked state (bed starts on first gesture, visual alone still sufficient); a11y floor "every audio cue has a visual twin" | Cursor referenced in prose only ("attract cursor", "repulse cursor"); **no cursor token, no cursor component entry**; no audio tokens (acceptable — PRD defers tuning) | **Partial** — Gaps G1 + G2 |
| **FR-9** Bounded EffectBus | Spam state: input lock absorbs, "FX beyond EffectBus capacity (~4) drop oldest. Frame budget wins over completeness."; FX layer `pointer-events: none`, "never hit-tested, never a surface"; UJ-2 failure path | Elevation & Depth: "FX canvas overlays the DOM/SVG layer at full size and never draws a surface — only particles and flashes on transparent background" | **Covered** |

**No FR is entirely uncovered.** FR-8 is the only one with a materially incomplete spine.

---

## 2. Token Reference Integrity (`{path.to.token}` in EXPERIENCE.md → DESIGN.md frontmatter)

**Result: 0 broken references.** All 17 distinct references resolve.

| Reference | Line(s) in EXPERIENCE.md | Resolves to | Status |
|---|---|---|---|
| `{spacing.rim-band}` | 33 | `spacing.rim-band: '14px'` | OK |
| `{motion.hold-commit}` | 59, 83 | `'400ms'` | OK |
| `{colors.shard-face}` | 68 | `'#0E2A22'` | OK |
| `{motion.pulse-idle}` | 68 | `'3200ms'` | OK |
| `{colors.shard-face-solo}` | 69 | `'#154538'` | OK |
| `{motion.preview-in}` | 69 | `'120ms'` | OK |
| `{colors.shard-face-mute}` | 70 | `'#081713'` | OK |
| `{colors.repulse-edge}` | 70 | `'#4E7C74'` | OK |
| `{motion.preview-out}` | 71 | `'180ms'` | OK |
| `{motion.eliminate-dissolve}` | 72 | `'220ms'` | OK |
| `{colors.cut-flash}` | 72 | `'#A7F3E4'` | OK |
| `{motion.redistribute}` | 72 | `'300ms'` | OK |
| `{motion.fuse-magnetize}` | 73 | `'260ms'` | OK |
| `{motion.seam-flash}` | 73 | `'120ms'` | OK |
| `{motion.solid-settle}` | 73 | `'320ms'` | OK |
| `{colors.solid-face}` | 74 | `'#176249'` | OK |
| `{colors.charge-glow}` | 95 | `'#3FE0A8'` | OK |

`{path.to.token}` on line 12 is the notation example, not a reference. Internal DESIGN.md references (`{spacing.7}`, `{spacing.5}`, `{rounded.none|sm|md}`, `{typography.meta}`, `{components.void-canvas.vignette}`, `{colors.*}`) also all resolve.

### 2.1 Hygiene: prose-only and orphan tokens (not broken, but loose)

These are the inverse risk — values a builder can't reach through a token path:

- **Line 74** — "`{colors.solid-face}` + halo": the halo is prose. `colors.solid-halo` (`#5CF0BC`) exists and `components.solid-charge.glow` binds it; EXPERIENCE should say `{colors.solid-halo}` or `{components.solid-charge.glow}` for symmetry.
- **`colors.seam` (`#0A1C17`)** — defined in frontmatter but referenced nowhere as a token; DESIGN.md Shapes hardcodes the literal `#0A1C17` instead, and no component entry binds it. The seam is a load-bearing visual (it *is* the crack), so it should have a `components.shard.seam` binding.
- **`colors.charge-core` (`#14B181`)** and **`colors.charge-pulse` (`#26C48F`)** — described in prose as the idle-pulse / stored-energy colours but bound to no component; the Idle state in EXPERIENCE only cites `{colors.shard-face}` + `{motion.pulse-idle}`, so *what colour the pulse actually is* is unbound.
- **`motion.ease-calm`** and **`motion.ease-magnetize`** — defined, never referenced by any state or component. Every EXPERIENCE state cites a duration and no easing, so the two curves PRD Open Question #1 asks for exist but are unassigned.
- **`colors.ink-primary` / `ink-secondary`**, **`typography.display` / `body`**, **`spacing.1`–`6`** — prose-level only. Acceptable for a spine, but `typography.display` holds the "one-line thesis" slot whose *content* is never specified (see G7).

---

## 3. Contradictions and Scope Drift vs PRD

| # | UX decision | PRD anchor | Assessment |
|---|---|---|---|
| C1 | **Keyboard floor proposal** (EXPERIENCE L95): shards tabbable, `Enter`/`Space` held = Commit, `Delete`/`Backspace` = Eliminate | Non-Goal: "Not modifier-key Solo/Mute"; MVP scope lists pointer-first web only | **Not a violation** — `Enter`/`Space`/`Delete` are not modifier keys, and Solo/Mute stay zone-based. But it introduces an input surface the PRD never scoped, and EXPERIENCE itself flags it `[NOTE FOR UX]` + Open Item 1. Keep as an open item; do not let it silently become build scope. Note the focus ring uses `{colors.charge-glow}`, which is the *commit* semantic colour — a focus ring that looks like an in-progress commit is a legibility risk against FR-2's "state changes remain legible" consequence. |
| C2 | **Touch / coarse-pointer behaviour** (EXPERIENCE L78): "Tap shard body = Commit (hold still applies), tap rim = Eliminate" | Non-Goals: "Not mobile app / haptics in v1"; §2.1 assumption: "mobile remains out of v1 build; **only the adapter contract** is designed for later" | **Mild scope drift.** The PRD reserves mobile for a later InputAdapter swap; EXPERIENCE specifies concrete coarse-pointer behaviour inline instead of expressing it as an adapter concern. Not contradictory (it's a degradation, not an app), but it should be framed as *"the Web adapter's coarse-pointer degradation"* to stay inside the PRD's adapter-only framing. Also unresolved against Open Item 4. |
| C3 | **Reduced-motion collapse** (EXPERIENCE L77): Eliminate and Commit resolve in a single 120ms cross-fade | FR-7 consequence: "Fuse/DeferReveal is visually readable as the hero moment"; SM-2 hero readability | **Tension, not contradiction.** Under `prefers-reduced-motion` the hero beat becomes a cross-fade, which weakens SM-2 for that cohort. Acceptable if stated as an explicit trade-off; currently it is stated as a flat rule. Recommend one sentence acknowledging that SM-2 is measured on the default-motion path. |
| C4 | **Hint line** (`Something here is unresolved.`) + **architecture credit** as persistent canvas elements | UJ-1 entry state: "no tutorial overlay required"; FR-1 consequence: no checkbox-list default metaphor; Non-Goal: not a dashboard | **Consistent.** Neither is an overlay, coach mark, or chrome bar; both are single lines of `ink-faint`/mono text, and EXPERIENCE's Voice table bans control legends. The hint line states *state*, not *controls*, which respects SM-1. Two invented elements the PRD never named, but both serve PRD goals (SM-1 orientation, SM-4 architecture story) — approve rather than cut. |
| C5 | **"Solid Charge — Terminal in v1. No further affordance"** | Glossary: "Solid Charge — Resolved DecisionNode (discharge / ThreadArc later — vision, not v1)" | **Consistent** with v1 scope. Flagged only because it closes the door visually with no forward hook — see G4. |
| C6 | **Zones "mutually exclusive; rim wins on overlap"** | FR-4/FR-5 define body vs rim/close zones | **Consistent and a genuine improvement** — resolves an ambiguity the PRD left open. |
| C7 | **Audio-blocked state**: "Bed stays silent, no banner" | FR-8: "Audio cues **must** start and stop with interaction phases" (not optional capability language) | **Consistent.** The bed starts on first pointer interaction, so phase-alignment holds for the whole interactive session; only the pre-gesture window is silent, and visual channels alone satisfy FR-4/FR-5 there. Correctly reasoned. |
| C8 | **No invented features** | Non-Goals: no accounts/sync/multiplayer/PWA, no Noise/Promise skins, no full closure loop, no skill-tree/inventory, no undo | **Clean.** Both spines stay inside v1: no persistence, no routing, no undo, one surface, Decision-only. No non-goal is breached. |

---

## 4. Dropped Qualitative Ideas

| # | Idea in PRD / addendum | Status in UX spines | Severity |
|---|---|---|---|
| **G1** | **Cursor morph (attract vs repulse)** — FR-4/FR-5 name it as one of the **two required simultaneous channels**; FR-8 requires "Cursor state reflects attract (commit) vs repulse (eliminate) intent"; addendum sensory ports specify "cursor via data attribute (attract / repulse)" | Named in prose in both spines, but **DESIGN.md has no cursor token, no cursor component, and no description of what the two cursors look like**. The single most load-bearing non-colour channel in the product is unspecified. | **High** — a required FR consequence is untestable as written |
| **G2** | **`eliminate-cut` audio cue** — addendum Sensory ports list `bed-start/stop, preview solo/mute, eliminate-cut, commit-chord`; FR-8 requires audio "during Solo/Mute **and Eliminate/Commit**" with cues that start and stop with interaction phases | EXPERIENCE's **Eliminating** state (L72) specifies dissolve, flash, redistribute, input lock, no undo — **but no audio at all**. Commit gets a chord and a decay; Eliminate gets silence. | **High** — direct FR-8 under-coverage |
| **G3** | **Binary-split spec** — FR-3 consequence "Binary and multi-shard (≥3) configurations are both supported"; PRD Open Question #1 explicitly asks for "DeferReveal **/ binary-split** animation timing and visual spec" (owner: UX) | DeferReveal is fully specified (magnetize → seam flash → settle with overshoot). The **binary-split half is not addressed**: no note on how a 2-shard node cracks/splits, and no easing assigned (`ease-calm` / `ease-magnetize` are defined but unbound). Open Question #1 is therefore half-resolved while reading as resolved. | **Medium** |
| **G4** | **ChargeNode family (Noise \| Promise \| Decision)** — PRD Glossary and addendum keep the family as reserved vision language; PRD Traceability row: "charge family / closure verbs / pulse → Glossary, FR-1, vision stubs" | The word **ChargeNode never appears** in either spine — only DecisionNode and Shard. No reserved token slot, no note that the one-hue palette must later differentiate Noise and Promise. The palette's "one hue family plus one cold outlier — nothing else is allowed" rule may actively box out a future Noise/Promise skin. | **Medium** — silent drop of reserved vision language with a forward-compat cost |
| **G5** | **Closure-loop verbs (Drop → Discharge → ThreadArc → Checkpoint Seal → Clarity Badge)** and **geometric-evolution / constellation-checkpoint vision language** (PRD §1, Glossary vision block, addendum) | Absent from both spines. Related: addendum FX event types include `seal-burst` and `ambient-spark`; EXPERIENCE covers eliminate/commit/seam FX but neither `seal-burst` (vision-tied, fine) nor **`ambient-spark`** — the ambient life of the field. | **Medium** for `ambient-spark` (it is v1 atmosphere, and the PRD's "serene spatial canvas" / "soft, pulsing charges" language leans on it); Low for the vision verbs themselves |
| **G6** | **Anti-cliché guardrails** — addendum: "Avoid purple-default / cream-serif / broadsheet clichés" | DESIGN.md Do's/Don'ts bans red/amber, multi-hue coding, neon green, display serif, decorative mono, drop shadows, cards, confetti. **The purple-default / cream-serif / broadsheet guardrail is not restated** — mostly implied by "no display serif" and the single-hue rule, but the explicit instruction did not survive. | **Low** |
| **G7** | **Narrative thesis string** — PRD §1 and SM-5: leave-behind is *closure > checkboxes*; §1 "peace of mind", "mental RAM freed", "suspended mental energy, not a row in a database" | DESIGN carries the *feeling* well (calm tension, "the visual reward for deciding is not a celebration — it is quiet", "Elevation is emission", stillness as reward) and `typography.display` reserves a slot for "the one-line thesis" — but **the thesis copy itself is never written**, and no spine states the *closure > checkboxes* line that SM-5 measures. The Voice table gives microcopy for the hint line and the quiet state; the title card is empty. | **Low–Medium** — SM-5 has no artifact to point at |
| — | Tone/atmosphere overall: serene, calm green depth, quiet focus, not a dashboard, no checkbox metaphor, dark emerald void over bright jade, Emerald as depth not gaming RGB, "closure not celebration" | **Preserved, and in places strengthened** (e.g. "Mute = drained saturation, never an error", "elimination reads as draining", "the difference the user feels is not 'brighter,' it is 'still'"). The qualitative core of the PRD survived the translation. | — |

---

## 5. Recommended Fixes (ordered)

1. **Add cursor specification to DESIGN.md** (G1): a `cursors` token group (e.g. `attract`, `repulse`, `neutral`) plus component entries for `shard-solo` / `shard-mute`, describing the morph visually. Then reference them from EXPERIENCE's Solo/Mute states so FR-4/FR-5's "two channels simultaneously" becomes testable.
2. **Add an Eliminate audio cue** to EXPERIENCE's Eliminating state (G2), matching the addendum's `eliminate-cut` port and FR-8's phase-alignment requirement.
3. **Specify the binary-split beat and bind the easing curves** (G3): assign `ease-calm` / `ease-magnetize` to the named motions and add a line on how a 2-shard node reads differently from ≥3. This closes PRD Open Question #1 properly.
4. **Bind orphan tokens** (§2.1): `colors.seam` into `components.shard`, `charge-core` / `charge-pulse` into the idle pulse, and swap the prose "halo" on EXPERIENCE L74 for `{colors.solid-halo}`.
5. **Add a one-line forward-compat note** on the charge family (G4) and reinstate `ambient-spark` as the field's ambient life (G5).
6. **Write the thesis line** for `typography.display` so SM-5's *closure > checkboxes* leave-behind has an artifact (G7); restate the purple/cream-serif guardrail in Don'ts (G6).
7. **Reframe C2** as the Web adapter's coarse-pointer degradation, and **re-colour the C1 focus ring** off `charge-glow` if the keyboard floor is accepted.
