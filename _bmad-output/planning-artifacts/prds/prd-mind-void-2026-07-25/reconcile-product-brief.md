---
title: Product Brief ↔ PRD Reconciliation — Mind Void
status: complete
created: 2026-07-25
brief: _bmad-output/planning-artifacts/briefs/brief-mind-void-2026-07-25/brief.md
prd: _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/prd.md
addendum: _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/addendum.md
verdict: minor gaps
---

# Reconciliation Report: Product Brief vs PRD (+ Addendum)

**Inputs reconciled:** Product Brief (draft) against PRD draft + Addendum.  
**Standard:** Brief intent must be preservable for downstream UX and architecture. Additive PRD content (Emerald theme, journeys, FR numbering) is noted but not treated as a gap.  
**Verdict:** **minor gaps** — v1 DecisionNode hero, scope fences, success metrics, and architecture spine are covered; vision vocabulary and charge-family framing are weak for UX/architecture continuity beyond the hero.

---

## 1. Coverage matrix

| Brief claim / requirement | PRD + Addendum | Status |
|---|---|---|
| Closure-first product job; peace of mind | §1 Vision; JTBD emotional | **Covered** |
| Open work = soft pulsing charges / suspended mental energy | Vision prose; UJ-1 “pulsing shards” only | **Weak** — not FR’d as idle ambient presence |
| Rejects checkbox as primary metaphor | FR-1 consequences; Non-goals; SM-5 | **Covered** |
| VoidCanvas spatial shell (DOM/SVG + Canvas) | Glossary; FR-1; MVP; Addendum layers | **Covered** |
| ChargeNode as unit of suspended energy | Glossary | **Covered** |
| Noise / Promise / Decision as distinct charge kinds (Decision = demo) | Noise/Promise only in Non-goals / deferred table | **Gap** — taxonomy not defined as vision invariant |
| DecisionNode: cracked/split polygon, 2–N shards | Glossary; FR-3 | **Covered** |
| Eliminate / Commit verbs | FR-6, FR-7; Glossary | **Covered** |
| Fuse → solid charge ready to discharge | Solid Charge glossary; FR-7; discharge = vision | **Covered** |
| Zone Solo/Mute (body vs rim), no modifier keys | FR-4, FR-5; Non-goals | **Covered** |
| DAW-style Solo/Mute interaction metaphor | Zone Solo/Mute only; “DAW-style” dropped | **Weak** — UX cue lost |
| Tension/release micro-audio + cursor attract/repulse | FR-8; Addendum sensory ports | **Covered** |
| EffectBus ~3–5, drop-oldest; ParticleEngine | FR-9; SM-3; Addendum | **Covered** |
| Canvas never owns pointer | FR-9; Addendum | **Covered** |
| Hybrid FX layer (DOM/SVG hit + Canvas FX) | VoidCanvas shell; Addendum hit-testing | **Covered** |
| Drop → Discharge → ThreadArc → Seal → Clarity Badge | Explicitly out of MVP; not Glossary’d as vision terms | **Gap** — verb grammar undefined for later UX/arch |
| Daily loops = abstract geometry; checkpoints = constellation shapes | “Constellation” only in brief vision echo; PRD thin | **Gap** — geometric evolution language missing |
| Web-first; mobile later via InputAdapter only | JTBD; Non-goals; MVP; Addendum | **Covered** |
| Three layers: InputAdapter \| FSM \| DomView + EffectBus | SM-4; Addendum architecture invariants | **Covered** |
| TypeScript contracts aligned with session sketches | MVP In Scope prose; Addendum sketch pointers | **Weak** — no FR/acceptance for contract artifacts |
| Primary audience: portfolio reviewers (~60s demo) | §2.1 Social JTBD; UJ-1 | **Covered** |
| Secondary audience: knowledge workers / mental RAM | Implied in vision; not explicit secondary user | **Weak** |
| Success: cold Solo/Mute + Eliminate/Commit discovery | SM-1; FR-4/5 | **Covered** |
| Success: DeferReveal/Commit as hero story moment | SM-2; FR-7 | **Covered** |
| Success: ~60fps under spam | SM-3; FR-9 | **Covered** |
| Success: one-diagram architecture story | SM-4 | **Covered** |
| Success: narrative *closure > checkboxes* | SM-5; §1 | **Covered** |
| Out: Noise/Promise skins, full loop, mobile/haptics, modifiers, skill-tree, accounts/sync | §5, §6.2; Addendum options table | **Covered** |
| Open Q: DeferReveal timing, audio, undo, sequencing | §8; Addendum open mechanism Qs | **Covered** (+ name, Emerald tokens) |
| Honest moat = craft + architecture, not market lock-in | §1; Addendum landscape / options | **Covered** |
| Emerald theme | Additive (not in Brief) — FR-2, Glossary, Addendum | **Additive OK** |

---

## 2. Gaps that matter (strict)

These are Brief ideas or requirements that are missing or too weak in PRD+Addendum for safe UX/architecture downstream. Ordered by impact.

### G1 — Charge taxonomy (Noise / Promise / Decision) not preserved as system model

**Brief:** Differentiation table and solution frame Decision as one of three charge kinds; Noise and Promise are deferred skins, not “non-concepts.”

**PRD+Addendum:** Noise/Promise appear only as non-goals / deferred build focus. Glossary defines ChargeNode → DecisionNode subtype, but never states the three-kind taxonomy as a product invariant.

**Why it matters:** Architecture and UX may design DecisionNode as a one-off widget instead of a ChargeNode family member with shared verbs/presence rules. Later Noise/Promise work then forks the model.

**Recommendation:** Add Glossary entries + a short Vision/Non-goals note: three ChargeKinds exist; v1 ships Decision only; shared ChargeNode contracts (presence, discharge readiness) are reserved.

### G2 — Full closure verb grammar undefined (vision vocabulary)

**Brief:** Solution language is Drop → Discharge → ThreadArcs → Seal checkpoints → Clarity Badges; void goes quiet again. Out of v1 build, but named as the product story.

**PRD+Addendum:** Correctly excludes the full loop from MVP. Glossary stops at Solid Charge (“ready to discharge”). Drop, Discharge, ThreadArc, Checkpoint, Clarity Badge are not defined.

**Why it matters:** UX and architecture will invent synonyms or skip end-state “quiet void” semantics when sketching post-hero sequencing (Open Question #4). Solid Charge’s “ready to discharge” has no named next verb in the contract.

**Recommendation:** Glossary vision stubs (marked vision-only / not FRs) for Drop, Discharge, ThreadArc, Checkpoint Seal, Clarity Badge; one sentence that v1 ends at Solid Charge.

### G3 — Geometric evolution / constellation checkpoint language missing

**Brief:** Daily loops use abstract geometry; major checkpoints evolve into constellation-like shapes — part of the spatial identity beyond cracked Decision shards.

**PRD+Addendum:** DecisionNode = cracked polygon only. Constellation/checkpoint geometry is not carried into Vision or vision stubs.

**Why it matters:** UX may lock a single “shard toy” look and lose the Brief’s readable progression from everyday charges → major sealed forms — important for portfolio narrative and later epic scope.

**Recommendation:** One Vision or Addendum “visual language” bullet: abstract daily geometry vs constellation checkpoints (post-v1); DecisionNode cracks are the v1 instance of that language.

### G4 — Idle “soft pulsing charge” atmosphere not required

**Brief:** Open work appears as soft, pulsing charges; unfinished intention is felt as suspended energy in a serene void.

**PRD+Addendum:** “Soft, pulsing” appears in Vision copy; UJ-1 mentions noticing pulsing shards. No FR/consequence that idle ChargeNodes pulse / breathe as ambient presence under Emerald.

**Why it matters:** UX can ship static shards + hover FX and still pass current FRs, undercutting the Brief’s core feel (mental energy, not icons).

**Recommendation:** Add a testable consequence under FR-1 or FR-3: idle DecisionNode communicates suspended energy via subtle pulse/breath (performance-safe); Emerald calm, not neon.

### G5 — Secondary user / mental-RAM product vision thin

**Brief:** Secondary audience = knowledge workers drained by open loops; v1 success still = reviewer reaction.

**PRD+Addendum:** Strong primary (portfolio) JTBD and journeys; secondary audience not stated. Emotional JTBD covers tension release but not “promises to a future self / parked to relieve conscience.”

**Why it matters:** Lower than G1–G4 for v1 build, but UX copy and case-study framing may overfit “hiring-manager demo” and lose the Brief’s human problem story.

**Recommendation:** One §2.1 secondary-user line + optional problem beat in Vision (open loops occupy working memory).

---

## 3. Weak but acceptable (non-blocking)

| Item | Note |
|---|---|
| DAW-style Solo/Mute reference | Zone model is specified; DAW analogy is optional UX research cue — restore in UX spec if useful. |
| TypeScript contracts as deliverable | MVP mentions alignment with sketches; Addendum points to sketch sources. Architecture story can lock APIs later — prefer explicit “contracts from sketches” in architecture epic. |
| Problem-section depth (Zeigarnik / conscience parking) | Landscape digest in Addendum compensates partially; not required as FRs. |
| Hold-to-commit ~400ms | Additive from sketches (Addendum / FR-7) — good; not a Brief conflict. |
| Emerald theme | Additive builder lock — consistent; Open Q #6 for tokens. |

---

## 4. Conflicts / regressions

No hard conflicts found. PRD does not contradict Brief scope fences, hero focus, or architecture spine.

**Additive deltas (OK):** Emerald theme; UJ-1/UJ-2; FR numbering; hold-to-commit; counter-metrics; expanded Open Questions (name, Emerald tokens).

**Assumptions:** Brief assumptions retained and expanded in §9; undo-after-Eliminate default-none matches Brief open question framing.

---

## 5. What is solidly covered (do not re-litigate)

- DecisionNode as v1 hero (binary + multi-shard), Eliminate / Commit, DeferReveal hero readability  
- Zone Solo/Mute without modifiers; cold discoverability (SM-1)  
- Bounded EffectBus + ~60fps under spam; canvas `pointer-events: none`  
- Multi-sensory tension/release + cursor morph  
- Web-first InputAdapter → DecisionNodeFSM → DomView + EffectBus → ParticleEngine  
- Explicit non-goals matching Brief Out list  
- Portfolio-primary success definition (not retention/revenue)  
- Open questions set preserved and extended  

---

## 6. Recommended PRD/Addendum patches (minimal)

1. **Glossary:** ChargeKind = Noise \| Promise \| Decision (v1 ships Decision); vision stubs for Drop, Discharge, ThreadArc, Checkpoint, Clarity Badge.  
2. **Vision (2–3 sentences):** geometric evolution (abstract daily → constellation checkpoint); full loop ends in quiet void / Clarity Badge; v1 stops at Solid Charge.  
3. **FR-1 or FR-3 consequence:** idle soft pulse / suspended-energy presence.  
4. **§2.1:** one secondary-user line (knowledge worker / mental RAM).  
5. **Optional Addendum:** restore “DAW-style zone Solo/Mute” as interaction reference for UX.

---

## 7. Verdict

| Dimension | Assessment |
|---|---|
| v1 build contract (DecisionNode demo) | Covered |
| Scope fences / non-goals | Covered |
| Success metrics | Covered |
| Architecture spine | Covered (Addendum) |
| Vision vocabulary & charge-family model for UX/arch continuity | Minor gaps (G1–G4) |
| **Overall** | **minor gaps** |

PRD+Addendum are implementation-ready for the DecisionNode hero. Close G1–G4 before UX/architecture so post-hero sequencing and ChargeNode family design do not diverge from the Brief.
