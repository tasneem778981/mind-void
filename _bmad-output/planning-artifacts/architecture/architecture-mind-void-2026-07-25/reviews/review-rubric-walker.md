---
review: rubric-walker
target: _bmad-output/planning-artifacts/architecture/architecture-mind-void-2026-07-25/ARCHITECTURE-SPINE.md
gate: pre-handoff (architecture spine -> epics/stories)
reviewer_mode: judge, do not rewrite
grounding:
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/prd.md
  - _bmad-output/planning-artifacts/ux-designs/ux-mind-void-2026-07-25/EXPERIENCE.md
date: 2026-07-25
verdict: return-for-targeted-revision
---

# Rubric-Walker Review — ARCHITECTURE-SPINE.md (Mind Void)

## Verdict

**Return for targeted revision.** This is a strong spine: 20 ADs, nearly all at the right altitude, nearly all with a mechanically checkable Rule, and a Deferred list that mostly does its job of naming the invariant that keeps each deferral cheap. It is not padded and it does not re-document its inputs. But it fails the gate on four **rule-level contradictions** (AD-9 against itself and AD-5; AD-1 against AD-6/AD-7/AD-17; AD-17 against the State-mutation convention; the state chart against AD-19), on one **unspecified public contract** that every story touches (`mountMindVoid` options), and on two dimensions this altitude owns that are left genuinely **silent** (accessibility semantics, and the delivery mechanism for audio and the cursor). Each of those is a place where two story-sized units will confidently build incompatible things.

Scope note: the two mermaid blocks were validated by static grammar reading only. No Node runtime is available in this workspace (`node`/`npm` not on PATH), so no parser was executed. Both read as valid; the substantive diagram defects below are semantic, not syntactic.

Severity key: **critical** = stories cannot proceed / guaranteed rework. **high** = two units will diverge or a stated guarantee is unmet. **medium** = a story must invent a spine-level decision. **low** = hygiene, traceability, altitude drift.

---

## 1. Does it fix the real divergence points for the level below?

Well covered — the spine correctly identifies and closes the divergence points that matter most: state ownership (AD-2), the single lock gate (AD-3), the closed intent set (AD-4), single-source durations (AD-5), single geometry owner (AD-6), hit-testing by DOM rather than arithmetic (AD-7), the focus/preview split (AD-8), lossy-vs-lossless channels (AD-9), the wiring site (AD-14), and the token source (AD-16). AD-8 in particular is exactly the kind of decision a spine exists to make: three independent snapshot fields, so neither adapter guesses.

Missed divergence points follow.

### F-1 — `mountMindVoid(root, opts)` is the declared public contract and sole config channel, but `opts` is never specified — **high**

AD-14 makes `mountMindVoid` the only wiring site, the Config convention makes options the *only* configuration channel ("no environment variables, no globals, no query-string flags"), and the Operational envelope makes it the public embed API. Nothing anywhere fixes its shape. Open at story time: shard count, `nodeRadius`, `seamConfig`, a reduced-motion override for testing, an audio-off switch, an RNG seed, and whether invalid options throw or clamp (the Errors convention only covers shard count 2–5).

This compounds into a live three-way tension: AD-6 takes `nodeRadius` as a `ShardGeometry` input, AD-16 forbids any spacing literal outside the generated token artifact, and AD-14 says configuration arrives only as options. So is `nodeRadius` a token or an option? Both answers are defensible under the current text, and the FR-1 shell story and the FR-3 shard story will pick differently.

### F-2 — Ownership of the client-to-local transform and the SVG layer host is undecided, and every available answer violates an AD — **high**

`VoidCanvas` is listed in the adapter ring and owns "layer scaffold + client-to-local transform" in the Structural Seed. AD-6 says only `VoidCanvas` may call `getBoundingClientRect`. AD-17 requires `PointerAdapter` to re-hit-test a cached *client* position, which needs that transform. AD-7 requires `DomView` to render shard paths into the SVG layer that `VoidCanvas` scaffolds.

But AD-1 states: "No adapter imports another adapter — adapters communicate only through intents, the snapshot, and the ports." `VoidCanvas` is an adapter. `ports.ts` carries exactly `Clock · AudioPort · FxSink` — no viewport/transform port. `VoidCanvas` is absent from the dependency graph and absent from AD-14's construction list. A story therefore chooses between: import `VoidCanvas` from `PointerAdapter`/`DomView` (violates AD-1), call `getBoundingClientRect` locally (violates AD-6), or accept an injected callback/element that no AD declares. This is the single most likely source of early rework because it lands in the first three adapter stories simultaneously.

### F-3 — Snapshot subscription mechanics are load-bearing and unspecified — **high** (see also F-5)

Two subscribers are shown (`DomView`, `PointerAdapter`). AD-17's re-hit-test is only correct if the DOM already reflects the new geometry when the pointer adapter runs, i.e. notification order matters. Nothing fixes: push vs pull, subscriber ordering, whether dispatch notifies synchronously, or whether a snapshot is emitted on *every* transition including no-op ones (AD-18 says "only on a transition"; the table implies dropped intents produce nothing).

### F-4 — `FxEvent` payload shape is never fixed, though AD-9 closes the *type* set — **medium**

AD-9 pins three event types and the bus capacity, which is the hard part. It never pins the payload. `ParticleEngine` is bound by AD-6 to `ShardGeometry`, so a story must decide whether origin/outward-normal/shard identity travel *in* the event or are recomputed engine-side from a shard id — and recomputation needs `shardCount`/`nodeRadius`, which the engine has no declared route to after a redistribute. Three modules depend on this one shape.

### F-5 — AD-17 requires exactly what the State-mutation convention forbids — **high**

Convention: "Subscribers must not dispatch synchronously from inside a snapshot callback." AD-17: the pointer adapter observes the snapshot leaving a locked phase and "dispatches a fresh `PREVIEW_SET`". Unless the adapter defers to a microtask, `rAF`, or a queue — which nothing specifies — AD-17 instructs a violation of the convention. A reviewer holding the convention and a reviewer holding AD-17 will reject each other's PR.

### F-6 — Randomness ownership is undecided, and AD-1's purity list does not cover it — **medium-high**

AD-1 enumerates `document`, `window`, timer, and audio APIs. It does not name `Math.random` or `Date.now`. A cracked-seam jitter inside `ShardGeometry`, a tie-break in the FSM, or a particle spawn distribution can therefore be nondeterministic while violating no letter of AD-1 — which defeats AD-1's own "Prevents" (an untestable core) and quietly undermines AD-5's injected `Clock`. Whether "cracked" geometry is deterministic from `seamConfig` or randomized at construction is a real product-visible decision (recordability, UJ-2) and it is silent.

### F-7 — Resize semantics: does the node scale or re-derive? — **medium**

AD-6 caches the root rect behind a `ResizeObserver` dirty flag; AD-17 re-syncs preview on host resize; the Rendering-layers note says everything is sized to the mount root, not the viewport. Nothing says whether a resize (a) changes nothing geometrically because the SVG uses a fixed `viewBox`, or (b) recomputes `ShardGeometry` at a new `nodeRadius`. Option (a) makes "VoidCanvas local CSS pixels" a fiction; option (b) makes resize a geometry-change event that AD-13's node-keying and AD-17's re-sync must both survive. The shell story and the geometry story will answer differently.

### F-8 — Fine-pointer `ELIMINATE` trigger is undecided while the coarse one is fixed — **low-medium**

AD-19 specifies touch-on-rim sends `ELIMINATE`. For the fine pointer, AD-7 only resolves the *zone*; nothing says whether `ELIMINATE` fires on `pointerdown` or on `pointerup`/`click`. It matters: `pointerdown` makes press-and-drag-off still destructive, on an irreversible action.

---

## 2. Is every AD's Rule enforceable?

Most are unusually good — AD-1, AD-3, AD-4, AD-6, AD-7, AD-9 (mechanics), AD-10, AD-11, AD-12, AD-14, AD-15, AD-16, AD-19 and AD-20 all contain clauses a PR reviewer can point at and objectively fail. AD-18's "never reads layout" is checkable by grep. Exceptions:

### F-9 — AD-18's shedding clause is aspirational — **medium**

"Sheds particles rather than frames when over budget" has no budget, no cap, no threshold, and no owner of the measurement. A reviewer cannot say a PR violates AD-18. FR-9/SM-3 give a ~60fps target, so the number exists at product level and simply has not been turned into an architectural constraint (max live particles, frame-time ceiling, or a shed policy). Every FX story will pick its own.

### F-10 — AD-5's "may never suppress the `seam-flash` FX event" is not enforceable against a lossy channel — **medium** (mechanism cause is F-11)

The clause is the right intent and is checkable against the *reduced-motion profile* (no profile switch may zero it). It is not checkable against runtime suppression, because the transport AD-9 assigns to `seam-flash` is explicitly drop-oldest.

### F-11 — AD-3's locked-phase list and `solid` give two answers to one question — **low**

AD-3 names three locked phases and separately says `solid` is terminal; the lock table says `solid` accepts none. "Is `solid` locked?" therefore has a yes-by-effect and a no-by-enumeration answer. Trivial to fix, but the enumeration is the thing a reviewer greps for.

### F-12 — Two closing sentences are guidance, not rules — **low**

AD-4's "An intent needing a device-specific field to work is a design error, not a new field" and AD-5's "the hero beat stays marked even when it stops being cinematic" decide nothing on their own. Both sit behind operative clauses that *are* checkable, so this is cosmetic — noted only because the rest of the document is disciplined about the distinction.

---

## 3. Does each Rule prevent the divergence its "Prevents" claims?

Checked all 20. Seventeen match cleanly; AD-12 and AD-13 are exemplary (the Prevents names a specific user-visible failure and the Rule closes it in the one place both adapters inherit). Mismatches:

### F-13 — AD-9's Rule violates AD-9's own closing clause, and defeats the SM-2 guarantee — **high**

AD-9's Prevents: "a cue that PRD FR-8 makes mandatory being dropped by the bounded bus." Its Rule closes with: "Nothing required by FR-4, FR-5, or FR-8 may be routed through the `EffectBus`." Yet the same Rule routes `shard-commit` and `seam-flash` — the two FX beats that carry DeferReveal — through that same capacity-4 drop-oldest bus. AD-5 reinforces that `seam-flash` is required even under reduced motion. The UX keeps the seam flash specifically so the hero beat stays marked, and UJ-2's failure path promises that when the queue saturates "the hero beat still renders."

The spine's own reasoning for keeping `cut-flash` off the bus ("precisely because the UX makes it required") applies with more force to `seam-flash` and `shard-commit`, and is not applied. The input lock during `committing` makes saturation *unlikely* in practice, but the invariant as written permits dropping the hero cue, and an invariant that permits the thing its Prevents forbids is a hole. Either give the bus a non-droppable lane, or take these two off the bus the way `cut-flash` was taken off.

### F-14 — AD-1's Prevents is broader than AD-1's Rule — **medium-high**

Prevents: "Web APIs leaking into decision logic, which would make the core untestable." The Rule bans a specific enumerated set. Nondeterminism sources (F-6) and, less importantly, `structuredClone`/`performance`/`crypto` are untouched. The Rule under-delivers on the Prevents.

### F-15 — AD-10's Rule may be incapable of the cue it owns — **medium-high**

Prevents: adapter and view both writing a mandatory channel. The Rule fixes cursor mode as "a data attribute on the mount root by `DomView`". That mechanism supports switching between CSS `cursor` values. FR-8 and the UX call for a cursor *morph* toward attract vs repulse — if that is a rendered, animated element that tracks the pointer, then a data attribute on the root cannot express it, and the implementation needs a per-frame pointer-tracked element whose owner is undecided and whose obvious homes both conflict: `DomView` is forbidden a per-frame role by AD-18, and `ParticleEngine` owns the only `rAF` loop but is on the FX canvas that AD-7 keeps at `pointer-events: none`. Nothing in the spine decides whether the cursor is CSS keywords, a CSS `url()` asset, or a rendered element — and the choice reaches AD-1, AD-10, AD-18 and the asset pipeline. This is the clearest case in the document of a Rule fixing a mechanism without confirming the mechanism can carry the requirement.

---

## 4. Could anything under "Deferred" let two units diverge?

The Deferred list is mostly exemplary: each entry names the invariant that keeps the deferral cheap (AD-1/AD-4 for the mobile adapter, AD-9 for `seal-burst`, AD-11 for audio tuning, AD-19 for tap-to-preview, `FxSink` for the particle backend). `dragging`, multi-node, undo, persistence and i18n are all safely out of reach of v1 stories. Two entries are holes:

### F-16 — "Audio bed tuning" defers the tuning but the *mechanism* was never decided — **high**

AD-11 fixes the port surface and the autoplay gate, which is the right spine-level move. Nothing decides whether cues are synthesized in-port (oscillators/filters, zero assets) or played from sample files. That is not tuning — it is architecture, and it collides with two of the spine's own claims: the Data & formats convention asserts "the demo performs no I/O", and the Stack asserts zero runtime dependencies. Samples introduce fetch, decode, an asset directory, a not-yet-loaded state for `bed-start`, and a cache-busting/base-path concern. The FR-8 story and any later tuning pass will diverge immediately.

### F-17 — Deferring all non-core testing leaves every adapter story to invent its own verification, and leaves SM-1/2/3 with none — **medium**

"Core unit tests are the v1 floor" is a legitimate scope call, and the `test/` seed matches it. But nine of the thirteen capability rows land primarily in adapters, so each adapter story decides for itself whether it tests anything and how — the definition of a divergence. More pointedly, SM-3's frame budget, SM-2's hero readability and the reduced-motion path have no verification mechanism anywhere in the spine (and F-9 leaves the budget itself unnumbered), so "done" is undefined for exactly the stories the PRD measures.

---

## 5. Is every dimension this altitude owns decided, deferred, or open?

Decided and adequate: layering, state ownership, time, geometry, hit-testing, FX transport, tokens, naming, ids/units, state mutation, configuration, logging (explicitly none), observability (explicitly none), persistence (deferred with reason), stack, structure.

The **operational/environmental envelope** is largely well handled — the "one environment, no server, no datastore, no analytics, no service worker" paragraph is the right shape and pre-empts a whole class of story questions, and the public-entry-plus-standalone-caller framing is a genuinely useful invariant. Gaps below.

**Error handling** is adequate for a no-I/O demo: construction throws on bad shard count, port failures are swallowed at the port, and "the injected `Clock` is the only thing that unlocks a phase" is a sharp, checkable invariant that closes the worst failure mode (a permanently locked node). Minor residue: nothing says what the standalone `index.html` does with a thrown construction error, or what happens if `root` is detached.

**Performance**: ownership is decided well (AD-18 is a strong AD), the budget is not (F-9). Load performance — bundle ceiling, asset weight — is silent, which is defensible for a static single-page demo but leaves the audio/cursor/font asset questions (F-15, F-16, F-19) with no governing constraint.

**Accessibility**: partly decided, and the decided parts are good (AD-8's focus/preview split, AD-13's focus survival, AD-5's reduced-motion-by-data). One sub-dimension is silent — see F-18.

### F-18 — Accessibility *semantics* is a silent dimension — **medium-high**

Nothing decides how a shard becomes focusable inside SVG (which element carries `tabindex`, given SVG focusability is inconsistent across engines), what role or accessible name a shard exposes, or whether any state change is announced. AD-13 depends on real DOM focus being re-applied, so the focusable-element decision is load-bearing for an AD, not optional polish. AD-20's "no string literal appears in a component" actively collides with adding an `aria-label` in `DomView`, so the spine's own rules push against the fix. This cannot be deferred to the inputs: the UX Accessibility Floor covers contrast, reduced motion, audio-visual twinning and the key map — not semantics — and there is nothing to defer *to*. Note also that a product whose only words are three fixed strings has no textual fallback at all, which makes the naming decision more consequential than usual.

### F-19 — Build and delivery envelope: three undecided items — **medium**

(a) **Output mode.** The Operational envelope says `vite build` into a deployable folder *and* that the public entry is `mountMindVoid` for embedding in a portfolio shell. Those are two different Vite builds (app bundle vs library/ES-module export, possibly both). Undecided.
(b) **Base path.** "The built artifact is identical wherever it is hosted, so there is no environment-specific configuration to diverge" is not true for asset URLs under a sub-path deploy, which is the common portfolio case; Vite's `base` is precisely environment-specific configuration, and the Config convention has already banned environment variables.
(c) **Platform baseline.** No browser/ES target is stated, while the design leans on Pointer Events, `ResizeObserver`, WebAudio, CSS custom properties and `prefers-reduced-motion`. Absent a baseline, "does this need a fallback?" is answered per story.

### F-20 — AD-16 names a generator but never fixes its lifecycle — **medium-high**

AD-16 is the right invariant and `scripts/gen-tokens.ts` is the right shape. Undecided: when it runs (prebuild script, Vite plugin, manual), what executes a TypeScript script under the declared Node range (no runner is in the Stack, and the Stack simultaneously forbids tools that consume the compiler API), and whether the `.generated.*` artifacts are committed or ignored — and if committed, whether anything verifies they are not stale. Since the Stack pins `tsc --noEmit` and type-info-free ESLint as the only gates, nothing detects drift between `DESIGN.md` frontmatter and the generated output, which is the single failure mode AD-16 exists to prevent. Related: ESLint is constrained by the Stack prose but appears in neither the Stack table nor the Structural Seed.

### F-21 — Native browser focus during locked phases is unaddressed, and the gap crosses three ADs — **medium-high**

AD-3's lock drops *intents*. `Tab` is not an intent — it moves DOM focus natively, and native focus is not something the FSM can decline. So during `eliminating`/`redistributing` (up to 520ms in the full profile) a keyboard user can move DOM focus, the resulting `FOCUS_SET` is dropped, and DOM focus now disagrees with `focusedShardId` — which violates AD-2's "focus ... exists only inside `DecisionNodeFSM`." AD-13 then re-applies focus after `redistributing`, yanking it back. Native scrolling has the same shape. The spine needs to say whether shard elements are made non-focusable during locked phases, or whether the FSM accepts `FOCUS_SET` while locked as a declared exception.

---

## 6. Are the ADs at consistent altitude?

Broadly yes, and impressively so — most ADs read as "one decision plus its enforcement boundary," which is the right shape for a build substrate. Two notes, both minor:

### F-22 — AD-15 mixes altitudes — **low**

`event.repeat`, `preventDefault` on `Space`, and the specific `Delete`/`Backspace` binding are keyboard-story implementation detail. The genuinely cross-cutting parts (`CANCEL` on blur/`visibilitychange`, and `ELIMINATE` refused while `pressing`) are spine-level — and the second of those is a *phase guard*, so it arguably belongs beside AD-12 or in the lock table rather than inside an adapter AD, where a reader looking for FSM guards will not find it.

### F-23 — No AD is too vague to decide something — **pass**

AD-18's shedding clause (F-9) is the only sub-clause that decides nothing. Every AD otherwise closes at least one concrete divergence.

---

## 7. Redundant, overlapping, or contradicting ADs?

Contradictions are catalogued above: **F-13** (AD-9 vs AD-9/AD-5), **F-2** (AD-1 vs AD-6/AD-7/AD-17), **F-5** (AD-17 vs the State-mutation convention), **F-21** (AD-3 vs AD-2/AD-13), and **F-26** below (chart vs AD-19). Overlaps:

### F-24 — AD-10 mostly restates AD-9 — **low**

AD-9 already establishes that cursor state is lossless and snapshot-derived. AD-10's only new content is the ownership assignment to `DomView` and the mount-root scoping. Merge candidate — though if F-15 is resolved by a rendered cursor, AD-10 grows and should stay separate.

### F-25 — `ELIMINATE` guards are scattered across three places — **low**

AD-12 (refused at 2 shards), AD-15 (refused while `pressing`), and the lock table (absent from `pressing`'s accepted set). Not contradictory, but a reviewer checking "when is `ELIMINATE` legal?" must assemble the answer from three locations, and the state chart shows `idle --> eliminating : ELIMINATE` with no guard at all.

---

## 8. Mermaid verification

### Diagram 1 — dependency graph (`graph TD`)

**Syntax: valid** (static reading; no parser executed — no Node runtime available). All node and subgraph ids are unique and alphanumeric; every label is double-quoted, so the embedded `/`, `—`, `·` and `:` characters are safely inside string tokens; `subgraph id["label"]` is a supported form; `-->`, `-.->` and `-->|label|` / `-.->|label|` are all well-formed; edges terminating on a subgraph id (`mount --> core`, `mount --> adapters`) are legal in flowcharts and the subgraphs are declared before use. No cycles that would break layout.

**Semantic defects:**

- **F-2 (high, above):** `VoidCanvas` appears in the paradigm layer table and the Structural Seed but is absent from the adapter subgraph — so the transform/layer-host edges that AD-6, AD-7 and AD-17 depend on are invisible here, which is why the AD-1 collision went unnoticed.
- **F-27 — `keyboard` receives no snapshot edge — low-medium.** `pointer` and `view` both get `fsm -.->|snapshot| ...`. The keyboard path needs the focused shard to attach `HOLD_START`/`ELIMINATE` to (chart label: "keyboard, focused shard"), and `focusedShardId` lives only in the FSM per AD-2. Either the adapter reads the snapshot (edge missing) or it reads DOM focus (an undeclared second route to state that brushes AD-2's "DOM attributes are output only"). The diagram hides the choice.
- **F-28 — mixed edge granularity — low.** `mount --> core` / `mount --> adapters` target whole subgraphs while every other edge is node-level; AD-14's point is that mount constructs each named collaborator, which the coarse edges understate. Cosmetic.

### Diagram 2 — state chart (`stateDiagram-v2`)

**Syntax: valid** (static reading). `[*] --> idle` and `solid --> [*]` are correct start/end forms; every transition uses `-->` with a `:` description; one-line `note right of <state> : <text>` is legal; transition descriptions run to end-of-line as free text, so `PREVIEW_SET solo|mute`, the parenthesised `HOLD_START (keyboard, focused shard)`, commas and the `—` in the `solid` note all parse. (`|` is only a delimiter in *flowchart* edge labels, not in state descriptions.) One portability nit, **low**: `solo|mute` and `fuse-magnetize + solid-settle` are terse enough to read as syntax; `solo or mute` would be unambiguous to both a parser and a reader.

**Completeness against the lock-window table: pass.** All seven table phases (`idle`, `hovering`, `pressing`, `eliminating`, `redistributing`, `committing`, `solid`) appear in the chart. All seven are reachable: `idle` from `[*]`; `hovering` from `idle`; `pressing` from `idle` and `hovering`; `eliminating` from `idle` and `hovering`; `redistributing` from `eliminating`; `committing` from `pressing`; `solid` from `committing`. `solid` is the only dead end and it is the declared terminal, correctly noted. `redistributing --> idle` closes the eliminate loop. No orphan states, no states in the chart that are missing from the table.

**Consistency defects:**

### F-26 — the only `HOLD_END` exit from `pressing` contradicts AD-19 and strands the keyboard path — **high**

The chart routes `pressing --> hovering : HOLD_END before threshold`, and the prose justifies it as pointer-specific ("the preview under the pointer is still true"). But `pressing` is reachable from `idle` by two non-hover routes: the keyboard path (`HOLD_START` on the focused shard) and, per AD-19, the coarse-pointer path — and AD-19 states flatly that under `pointer: coarse` "`hovering` is unreachable and `pressing` is entered straight from `idle`." Releasing early on keyboard or touch therefore has **no defined target phase**, and the one edge that exists sends both into a phase AD-19 declares unreachable. `pressing --> hovering : PREVIEW_SET other shard` has the same pointer-only assumption. Relatedly, the `idle --> pressing` edge is labelled "keyboard" only, though AD-19 makes it the coarse-pointer entry too.

### F-29 — `CANCEL` in `hovering` has no edge — **medium**

The lock table lists `CANCEL` among `hovering`'s accepted intents and AD-15 makes it genuinely reachable there (sent on `blur` and `visibilitychange`). The chart shows `CANCEL` only out of `pressing`. Self-loop or `hovering --> idle`? Both are defensible — on window blur the pointer may well still be over the shard — so a story will decide, and the visual state (Solo glow persisting on a blurred window) follows from that choice.

### F-30 — the prose undercounts the exits it is explaining — **low-medium**

"Two cancel paths leave `pressing`" precedes a chart with four non-commit exits: `HOLD_END`, `PREVIEW_SET other shard`, `PREVIEW_SET neutral`, and `CANCEL`. The two the prose contrasts are the two *pointer-release* paths; as written it reads as an exhaustive enumeration of exits and is not one.

### F-31 — the `HOLD_END`-versus-threshold race is undecided — **low-medium**

`pressing --> committing` fires when the injected `Clock` reaches `hold-commit`; with a `rAF`-driven clock the threshold is only observed on the next tick, so a `HOLD_END` arriving after 400ms of real time but before that tick could be processed first and cancel a hold the user completed. Which wins is a one-line decision in the FSM and it is not made. FR-7's "~400ms" tolerates either, but two stories (pointer commit, keyboard commit) must not answer differently.

### F-32 — the chart carries no guards, so it cannot be read as authoritative — **low**

AD-12's two-shard floor and AD-15's "`ELIMINATE` refused while `pressing`" are invisible; `idle --> eliminating : ELIMINATE` and `hovering --> eliminating : ELIMINATE` appear unconditional. Also, `FOCUS_SET` is listed as accepted in `idle` and `hovering` but has no self-loop, even though `hovering --> hovering : PREVIEW_SET zone change` establishes the convention that non-phase-changing transitions *are* drawn. A guard notation (`[shardCount > 2]`) or an explicit "guards live in the ADs, not the chart" line resolves both.

---

## 9. Traceability and hygiene

### F-33 — AD-2 and AD-17 appear in no Capability → Architecture Map row — **low**

Every other AD is cited at least once. AD-2 is "Binds: all" so its absence is understandable, but AD-17 is a narrow, specific invariant that no capability claims — which is a weak signal that it is an orphan (and it is also the AD that collides with the State-mutation convention, F-5). Worth confirming it has an owner.

### F-34 — small internal inconsistencies — **low**

- AD-20 says the hint shows "until the first entry into `solid`", but `solid` is terminal, so there is exactly one entry; "first" implies a re-entry the chart forbids.
- AD-20 places the copy lifecycle in `DomView` driven by the injected `Clock`, while AD-18 forbids `DomView` a per-frame role and AD-5 frames the `Clock` as the FSM's. `thesis-hold` is a one-shot timer rather than a per-frame tick so there is no real conflict, but the `Clock` port now has two consumers with different usage patterns and the ports interface is not shown to support scheduling (`seam-flash` in the table needs the same one-shot scheduling capability). Worth one explicit sentence.
- The Stack's registry-verification claim (versions as of 2026-07-25) was **not** re-verified in this review; no network check was performed.

---

## 10. What would make this pass

Blocking, in the order a story-writer would hit them:

1. Resolve **F-13** — take `shard-commit` and `seam-flash` off the lossy bus, or give the bus a non-droppable lane; AD-9 currently forbids what AD-9 does.
2. Resolve **F-2** — declare how adapters obtain the client-to-local transform and the SVG layer host (a port, an injected element, or an explicit `VoidCanvas` exemption in AD-1), and add `VoidCanvas` to the graph and to AD-14's construction list.
3. Resolve **F-26** and **F-29** — define the `pressing` exit for the non-hover entry paths, and `CANCEL` in `hovering`.
4. Resolve **F-5** — state whether snapshot subscribers may dispatch, in what order they are notified, and how AD-17's re-sync is scheduled.
5. Specify **F-1** — the `mountMindVoid` options contract, and whether `nodeRadius` is a token or an option.
6. Decide **F-16** and **F-15** — audio synthesis vs samples, and whether the cursor is a CSS value or a rendered element; both reach the "no I/O" and "no runtime dependencies" claims.
7. Close **F-18** — the focusable element, accessible naming, and whether AD-20's no-literals rule admits accessibility strings.

Strongly recommended: **F-9** (a number for the frame budget), **F-20** (generator lifecycle and drift detection), **F-21** (native focus under lock), **F-6** (randomness ownership), **F-19** (build output mode, base path, platform baseline), **F-7** (resize semantics), **F-4** (`FxEvent` payload).

Hygiene: F-8, F-11, F-12, F-17, F-22, F-24, F-25, F-27, F-28, F-30, F-31, F-32, F-33, F-34.
