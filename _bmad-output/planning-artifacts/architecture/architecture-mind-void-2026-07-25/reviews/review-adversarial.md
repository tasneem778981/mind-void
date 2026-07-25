---
name: 'Mind Void — Adversarial Spine Review'
type: review-adversarial
target: _bmad-output/planning-artifacts/architecture/architecture-mind-void-2026-07-25/ARCHITECTURE-SPINE.md
gate: pre-handoff
reviewer_lens: 'divergence hunting — can two AD-compliant stories build incompatibly?'
created: '2026-07-25'
holes_found: 21
critical: 6
high: 10
medium: 5
---

# Adversarial Review — Architecture Spine, Mind Void

## Method

One question, asked twenty-one times: **name two story-sized implementation units, have each obey every AD to the letter, and see whether they can still fail to compose.** Every hole below is demonstrated with a named pair, the specific legal-but-divergent choice each unit makes, and the observable product failure. Nothing is reported that I cannot pin to a pair.

Assumed story decomposition (one level below the spine):

| Story | Unit |
|---|---|
| S-A | `core/shard-geometry.ts` |
| S-B | `core/decision-node-fsm.ts` — commit path (`pressing` → `committing` → `solid`) |
| S-C | `core/decision-node-fsm.ts` — eliminate path (`eliminating` → `redistributing`) |
| S-D | `adapters/web/dom-view.ts` — shard rendering + state attributes |
| S-E | `adapters/web/particle-engine.ts` |
| S-F | `adapters/web/pointer-adapter.ts` |
| S-G | `adapters/web/keyboard-adapter.ts` |
| S-H | `adapters/web/web-audio-port.ts` |
| S-I | `adapters/web/raf-clock.ts` |
| S-J | `adapters/web/void-canvas.ts` |
| S-K | `app/mount.ts` |
| S-L | `core/effect-bus.ts` |
| S-M | `scripts/gen-tokens.ts` |
| S-N | DomView copy lifecycle (AD-20) |

The spine is unusually strong on *ownership* (who may compute geometry, who may own state, who may wire). It is weak on three axes the ADs never name: **ordering**, **coordinate identity**, and **lifecycle**. All twenty-one holes fall into those three plus a handful of silent-Rule defaults.

---

## CRITICAL

### H-1 — The mandatory audio bed silently never starts

**Pair:** S-B (FSM: emit `bed-start`) vs S-H (WebAudioPort: lazy context + resume).

AD-11 gives each unit an unambiguous instruction, and the two instructions compose into silence:

- S-B reads AD-11 literally: "The FSM emits `bed-start` **once**, on the first intent that reaches it in a session." UJ-1 step 2 is a hover. The first intent that reaches the FSM in the overwhelming majority of sessions is a `PREVIEW_SET` synthesised from `pointermove`.
- S-H reads AD-11 literally: "the `AudioContext` is created lazily and resumed inside the port implementation… on failure the port silently no-ops and shows nothing."

`pointermove` does not grant user activation in any current engine. `AudioContext.resume()` on a `pointermove`-derived call rejects, or the context is created `suspended` and stays there. S-H no-ops per its Rule. S-B never emits `bed-start` again per its Rule. AD-11 also forbids the only repair inside the core: "The FSM never learns whether audio is audible," and AD-1 forbids the port from dispatching an intent to ask for a retry.

Net: **FR-8 — an explicitly mandatory, non-optional-capability requirement — is dead for most visitors, and by design nothing reports it.** The UX row "Audio blocked" says the bed starts "on the first pointer interaction," which the spine translated into "first intent," and those are not the same event class.

**Tightening required.** AD-11 must state that `bed-start` is a **latched request, not a fire-and-forget event**: the port records that the bed is wanted and is responsible for resuming on the next user-activating gesture, registering its own one-shot capture-phase `pointerdown`/`keydown` on the mount root for that purpose (which keeps activation detection out of the core and out of the intent set, preserving AD-4). Add to AD-11: "`bed-start` is idempotent and latching; the port retries until the context is running or the port is stopped. No intent is ever re-emitted for audio."

### H-2 — Rim clicks never eliminate

**Pair:** S-F (PointerAdapter, fine pointer) vs S-B (FSM: AD-15's refuse-`ELIMINATE`-while-`pressing`).

The spine specifies the **coarse** pointer's event mapping precisely (AD-19: `pointerdown`→`HOLD_START` on body, rim tap → `ELIMINATE`) and never specifies the **fine** pointer's. Two legal S-F implementations:

- S-F(a): `pointerdown` anywhere inside a shard → `HOLD_START`; rim `ELIMINATE` on `click`, matching UX "Click on the rim eliminates" and the Rim band row "Click → Eliminate." This is the natural reading: the hold-progress indicator lives *on the perimeter*, so a press near the perimeter is obviously still a press.
- S-F(b): `pointerdown` on `data-zone="body"` → `HOLD_START`; `pointerdown` on `data-zone="rim"` → `ELIMINATE`, no `HOLD_START`, mirroring AD-19.

S-B implements AD-15's clause verbatim — "`ELIMINATE` is refused while the phase is `pressing`" — which the lock table confirms as FSM-enforced for both adapters (`pressing` accepts only `HOLD_END`, `PREVIEW_SET`, `CANCEL`).

Compose S-F(a) with S-B: the rim `pointerdown` puts the FSM in `pressing`; the `click` that follows carries `ELIMINATE`, which lands in `pressing` and is **refused**; `pointerup` then delivers `HOLD_END` and returns to `hovering`. **Every rim click is a no-op. FR-6 is unreachable by pointer.** Both units are fully AD-compliant.

Compose S-F(b) with S-B and it works — but only because S-F guessed. Worse, S-F(b) alone breaks the UX contract in the other direction: `ELIMINATE` on `pointerdown` fires before the user can abort by dragging off, on an irreversible, undo-free action.

**Tightening required.** AD-19 must be generalised into an **event-mapping AD that covers both pointer classes and both zones**, stated as a table: which DOM event, which zone, which intent, and explicitly that a rim `pointerdown` emits **no** `HOLD_START`. AD-15's refuse-while-`pressing` clause must also be restated as device-neutral (it currently reads as a keyboard concern but is enforced globally), so the pointer story knows it is bound by it.

### H-3 — `redistributing` has no animation mechanism and no owner

**Pair:** S-D (DomView must animate the redistribute) vs S-A (`ShardGeometry` has no interpolation surface).

AD-6 declares `ShardGeometry` a pure map from `(shardCount, nodeRadius, seamConfig)` to polygons — a function of the *final* configuration, with no time parameter — and forbids every other module from computing shard geometry. AD-18 hands the single rAF loop to `ParticleEngine` and states the FSM has no per-frame role. AD-5 gives `redistributing` a 300ms duration and the UX requires "survivors redistribute over `{motion.redistribute}` with `{motion.ease-calm}`."

So: something must produce shard polygons at intermediate values of `t`, and every candidate is forbidden.

- S-D takes the only path AD-6 leaves open — animate with CSS and compute no geometry. But SVG `points`/`d` are **not CSS-animatable properties**. S-D can therefore only animate a `transform` (translate/rotate/scale) between the pre- and post-elimination polygon sets.
- A transform cannot express the transition the spine actually requires. AD-6 itself says `ShardGeometry` covers "**both** the binary single-seam layout **and** the radial 3–5 layout." A 3→2 eliminate therefore **switches layout family mid-`redistributing`**: two radial thirds must become two halves across a differently oriented single seam. No affine transform of a third produces a half. S-D's animation is a visible snap on the most-watched 300ms of the demo, or S-D quietly starts computing tween polygons and violates AD-6.
- S-A's alternative — add `ShardGeometry.at(progress)` or `interpolate(from, to, t)` — is legal for the core (still pure) but immediately requires a per-frame caller. The FSM cannot (AD-18). `ParticleEngine` owns the loop but may not import `DomView` (AD-1) and has no business writing SVG. `DomView` would need its own rAF loop, contradicting AD-18's "exactly one `requestAnimationFrame` loop."

**This is the hero-adjacent animation and there is no legal implementation.** The same argument applies to `committing`'s "magnetize inward": shards travelling to a fused solid is transform-expressible, but "cracks gone" is a topology change, not a transform.

**Tightening required.** A new AD must decide the interpolation strategy and name its owner. Realistic options, pick one and write it down: (a) `ShardGeometry` gains an explicit `layout(count, t?)` returning polygons for a *morph pair*, and `DomView` is granted a second, geometry-only rAF loop with AD-18 amended to "exactly one rAF loop per adapter that animates, and `ParticleEngine` owns the FX loop"; (b) shard polygons are constrained to a **single topology across all counts 2–5** (n wedges of a disc, binary being n=2) so that redistribute is pure rotation + wedge-angle change and can be driven by CSS custom properties updated once per snapshot with an interpolated `--mv-wedge-angle`; (c) redistribute is declared a cross-fade between two static polygon sets, matching what reduced motion already does, and the UX's "redistribute over 300ms with ease-calm" is renegotiated. Option (b) is the only one that keeps AD-6 and AD-18 intact and should be stated as an invariant on `ShardGeometry`'s output, not left to the DomView story.

### H-4 — A body→rim pointer move during `pressing` has no defined outcome

**Pair:** S-F (PointerAdapter: dispatch `PREVIEW_SET` on every zone change, unconditionally, per AD-3 and AD-7) vs S-B (FSM commit path).

The state chart enumerates three `PREVIEW_SET` outcomes from `pressing`: *other shard* → `hovering`, *neutral* → `idle`, and (by omission) nothing for **the same shard with a changed zone**. `hovering` has an explicit `hovering --> hovering : PREVIEW_SET zone change` arrow; `pressing` has none. AD-3 forbids S-F from gating, and AD-7 makes zone resolution the browser's hit test on `event.target`, so a 2px pointer drift from `data-zone="body"` to `data-zone="rim"` **will** dispatch `PREVIEW_SET { shardId: same, mode: 'mute' }` mid-hold. This is not an edge case: the hold-progress indicator is rendered *on the perimeter*, actively drawing the user's pointer toward the rim band, and the rim band is a `{spacing.rim-band}` inset the user cannot see at rest.

Three legal S-B readings, all defensible:

- S-B(a): unlisted transition ⇒ no-op. Hold survives; `previewMode` is now stale (`solo` while the pointer is over the rim), so DomView shows the Solo face for a rim-hovering pointer.
- S-B(b): the chart's `pressing` rows are the complete `PREVIEW_SET` handling, and a zone change is "not the same preview," so route it like a shard change → `hovering`. **The hold cancels whenever the pointer nears the perimeter.** FR-7 and SM-2 become intermittent.
- S-B(c): treat `mute` on the pressed shard as an intent to eliminate-preview → `hovering` + `previewMode: mute`, so the progress ring rewinds and the rim lights up. Same cancellation as (b), differently rendered.

Then compose with AD-12: on a binary node, S-B must coerce `mute` → `neutral` (AD-12), and `PREVIEW_SET neutral` from `pressing` is charted as → `idle`. So on the **binary** node — the configuration UJ-2 explicitly records the hero beat on — reading (b)/(c) makes the commit hold cancel on rim drift *with certainty*, via a coercion that exists for an unrelated reason.

**Tightening required.** Add an explicit row to the state chart and the lock table: `pressing --> pressing : PREVIEW_SET same shard, any zone` — the press outlives zone changes on the pressed shard — and state that `previewMode` **is** updated by it while `phase`/`pressedShardId` are not, so DomView's rendering stays truthful. Also state explicitly that AD-12's `mute`→`neutral` coercion does **not** trigger the `PREVIEW_SET neutral` cancel path when the shard id is unchanged. Without both sentences, the two most-watched interactions in the product are coin-flips.

### H-5 — Two coordinate origins collide inside one field

**Pair:** S-A (`ShardGeometry`) vs S-J (`VoidCanvas`), consumed incompatibly by S-E (`ParticleEngine`).

AD-6 says `ShardGeometry` output is "all in VoidCanvas local space." The Conventions say "all coordinates are numbers in VoidCanvas local CSS pixels." But AD-6 also fixes `ShardGeometry`'s signature as `(shardCount, nodeRadius, seamConfig)` — **a function with no knowledge of the canvas size or the node's position within it.** A pure function of `nodeRadius` can only produce **node-centred** coordinates, origin at the node's centre, and it is free to pick +y up (mathematical, natural for radial layout via `cos/sin`) or +y down (screen).

S-J's job is the opposite convention: AD-6 says "only `VoidCanvas` calls `getBoundingClientRect`… only to convert client space to local space," and client→local conversion lands on the **canvas top-left** origin, +y down. Both are honestly describable as "VoidCanvas local CSS pixels."

AD-4 then merges the two spaces into a single field: "`at?: { x, y }` is an optional FX-origin hint that **falls back to the `ShardGeometry` centroid** when absent."

Demonstrated failure, both units compliant:
- Pointer eliminate: `at` is present, produced by S-J's client→local transform → canvas-top-left space. S-E spawns the burst under the pointer. Correct.
- Keyboard eliminate (AD-15 `Delete`): S-G has no position, omits `at`, S-C falls back to the S-A centroid → node-centred space. S-E draws it at canvas coordinates `(centroid.x, centroid.y)` — i.e. **offset by the entire node-centre-to-canvas-origin vector, near the top-left corner of the canvas**, and mirrored vertically if S-A chose +y up.

The keyboard path's FX therefore lands in the wrong place while the pointer path's is correct, and no unit test in the declared `test/` tree (core only) can see it, because both values are "numbers in local CSS pixels."

**Sub-hole, same pair:** the FX canvas's backing store. S-E must draw in device pixels (`canvas.width = cssWidth * devicePixelRatio`) while receiving CSS-pixel coordinates. Nobody owns canvas sizing: S-J is "layer scaffold" and would naturally set `width`/`height` on resize; S-E owns the drawing and would naturally do the same in its rAF loop. **If both do it, whichever writes second clears the bitmap** (assigning `canvas.width` resets the surface), producing a flicker on every resize, mid-animation. If neither, the canvas is 300×150 default.

**Tightening required.** AD-6 must name **one** origin and one axis direction for `ShardGeometry` output — recommend: origin at the node centre, +y down, and add `nodeCenter` / `viewBox` as an explicit, separately-owned placement value produced by `VoidCanvas` and injected by `mountMindVoid`. Then AD-4 must state that `at` is expressed in the **same** space as `ShardGeometry` output, and that the client→local transform in `VoidCanvas` returns that space (not canvas-top-left). Add to AD-6 or a new AD: `VoidCanvas` is the sole owner of every layer element's intrinsic size including the FX canvas's `width`/`height` attributes and DPR scaling; `ParticleEngine` receives a pre-scaled `CanvasRenderingContext2D` and never touches the element.

### H-6 — `HOLD_START`'s target shard has two possible sources

**Pair:** S-G (KeyboardAdapter) vs S-B (FSM commit path).

AD-4 says `shardId` is the only field a transition may read. AD-8 says `pressedShardId` is "set on `HOLD_START` from either device." But the state chart annotates the two entries into `pressing` by device — `idle --> pressing : HOLD_START (keyboard, focused shard)` — a distinction AD-4 makes it structurally impossible for the FSM to observe. That annotation invites S-B to implement the *semantics* it describes:

- S-G(a): `HOLD_START { shardId: snapshot.focusedShardId }` — S-G subscribes to the snapshot to fill the field. Legal (AD-17 already establishes that adapters may observe the snapshot).
- S-B(a): `HOLD_START` sets `pressedShardId = intent.shardId`. Legal.
- S-B(b): "`HOLD_START` presses the focused shard" per the chart annotation; `intent.shardId` is ignored or only used as a tiebreak. Legal — and arguably *more* faithful to the chart.

S-G(a) + S-B(a) is correct. S-F + S-B(b) is a disaster: a pointer press on shard C, while keyboard focus sits on shard A (AD-13 guarantees `focusedShardId` is **never null while a shard exists**, so this is the steady state after any Tab), commits **shard A**. The pointer is over C, the progress ring renders on `pressedShardId` = A per AD-8, and the wrong option wins the irreversible decision. Silent, deterministic, and untestable without a pointer test — which the Deferred section explicitly excludes ("DOM-level and end-to-end testing… Deferred").

**Tightening required.** AD-4 must state that `shardId` is **required, not optional, on `HOLD_START`, `PREVIEW_SET`, and `ELIMINATE`**, and that the FSM **never** substitutes `focusedShardId` for a missing or mismatched `shardId`. Strip the device annotations from the state chart or restate them as `HOLD_START (shardId = focused)` / `HOLD_START (shardId = hovered)` — non-normative comments about who typically sends what, explicitly labelled as such. Add: it is the adapter's responsibility to resolve which shard it means; the FSM has no fallback.

### H-7 — The `Clock` port has no declared surface, epoch, cancellation, or catch-up policy

**Pair:** S-I (`RafClock`) vs S-B/S-C (both FSM paths) — and S-N (copy lifecycle) as a third consumer.

`ports.ts` names `Clock`; no AD defines its shape. AD-5 says the FSM "advances out of a timed phase on an injected `Clock`," AD-20 says DomView uses "the same injected `Clock`" for `thesis-hold`, and the Errors row says "the injected `Clock` is the only thing that unlocks a phase." Four separate divergences follow, each demonstrable:

**(a) Cancellation is never mentioned, so stale timers can shortcut the 400ms.** S-B may legally implement either:
- *guard-on-fire*: schedule at `HOLD_START`, and when the callback runs, check `phase === 'pressing' && pressedShardId === x`, ignoring if stale. No cancellation API needed.
- *cancel-on-transition*: hold one handle, cancel on every exit from a timed phase.

With guard-on-fire: press shard A, release at 150ms (→ `hovering`), press A again at 300ms. Two timers pending. The **first** fires at t=400 into a state that passes the guard — `pressing`, `pressedShardId === A` — and commits at **100ms of actual hold**. This is precisely the failure AD-4 congratulates itself on preventing: "there is no `COMMIT` intent… so no input path can shortcut the 400ms." An input path shortcuts the 400ms, without any adapter misbehaving.

**(b) The epoch is undefined, so the lock can open before the motion ends.** AD-5's stated purpose is "so the input lock does not open while the shape is still moving." But the Clock countdown starts when the FSM *schedules*, while the CSS transition starts when the browser next recomputes style after S-D writes the attribute. If S-I's timers are rAF-driven, S-B schedules inside frame N's callback and S-D's attribute write lands in the same frame, committing style at frame N+1 — the transition ends one frame after the Clock does. The lock opens with the shard still mid-dissolve. Cumulative across `eliminating`→`redistributing`, and pathological on the reduced profile where `redistributing` is 0ms.

**(c) "A `0ms` phase passes through in one tick" (AD-5) does not say what a tick is.** S-I as rAF: 0ms costs ~16.7ms and one frame, so `redistributing` reduced-motion is a real frame and DomView renders it. S-I as `setTimeout(…, 0)`: ~1–4ms, likely no paint. S-B could also implement 0ms as a **synchronous** pass-through, which emits two snapshots inside one `dispatch()` call — every snapshot subscriber sees `redistributing` and `idle` in the same turn, and S-D's "one pass per snapshot" (AD-18) runs twice on the same frame, so the `redistributing` state never reaches the compositor and the reduced-motion cross-fade the UX requires ("the state change still happens") never renders.

**(d) No catch-up policy, so a backgrounded tab collapses the demo.** rAF stops when the tab hides. S-I legally computes elapsed from `performance.now()` deltas inside the rAF callback. Hide the tab at 10ms into `eliminating`, return five minutes later: the first frame delivers a ~300,000ms delta, **all pending phase timers fire in one frame**, and `eliminating`→`redistributing`→`idle` complete before a single paint. S-D writes three snapshots in one pass; the user sees a shard vanish instantly. On the commit path with no keyboard adapter mounted (so no AD-15 `CANCEL` on `visibilitychange`), returning to the tab **commits** a hold the user released minutes ago.

**(e) AD-18's "exactly one `requestAnimationFrame` loop" is contradicted by `RafClock`'s existence.** AD-18 scopes it to "for the whole canvas," which S-E will read as "I own the only loop." S-I must then either run a second rAF loop (violating the spirit and doubling the time bases), or piggyback on S-E's (adapter→adapter, banned by AD-1), or use `setTimeout` and stop being a `RafClock`.

**Tightening required.** A new AD-21 for the `Clock` port, fixing: the exact surface (`now(): number`, `after(ms, fn): CancelHandle`, and a monotonic `epoch`/generation token passed to callbacks); that **cancellation is mandatory** and the FSM holds at most one pending phase timer, cancelled on every transition, with a generation token so a stale callback cannot be mistaken for a live one; that the countdown epoch is the **first frame after the snapshot has been applied to the DOM**, giving the DOM a one-frame lead so the lock never opens early; that per-frame elapsed delta is **clamped** (≤2 frame intervals) so hidden-tab time does not collapse phases; and that a 0ms duration still costs exactly one Clock tick — the FSM never transitions synchronously within `dispatch()`. Amend AD-18 to "`ParticleEngine` owns the only *rendering* rAF loop; `RafClock` owns the only *timing* loop; no other module calls `requestAnimationFrame`."

### H-8 — Transition side-effect ordering is undefined, so required and lossy channels desynchronise

**Pair:** S-D (`DomView`) vs S-E (`ParticleEngine`), with S-B/S-C choosing the order.

A single `dispatch(ELIMINATE)` produces three side-effects: an `AudioPort.eliminate-cut` call (AD-9, direct, lossless), an `EffectBus` publish of `shard-eliminate` (AD-9, lossy), and a snapshot emission (AD-2/AD-18). **No AD orders them**, and AD-9 deliberately splits one visual beat across two of them: the `cut-flash` is "a one-frame CSS state on the shard element, not a bus event, precisely because the UX makes it required," while the particle burst for the same instant is a bus event.

Legal S-C orderings and their consequences:

- *snapshot first, then publish*: S-E's handler (or its next drain) resolves the burst origin from the current snapshot — which already reflects the reduced shard set. **`shardId` is no longer in the shard set**, and the AD-4 centroid fallback has nothing to fall back to. S-E legally drops the event, or spawns at the *post-redistribute* centroid of a different shard.
- *publish first, then snapshot*: S-E can resolve the origin, but the particles are visible before `data-phase="eliminating"` and `cut-flash` exist on the shard — the burst precedes the cut.
- *audio first vs last*: `eliminate-cut` is "a short filtered transient, no tail," which the UX aligns to the flash. Audio scheduled before the snapshot leads the visual by a frame; after, it trails.

Independently, S-D writes attributes synchronously inside the snapshot callback (AD-18: "one pass per snapshot") while S-E draws in its rAF tick. **The bus-carried burst is therefore structurally ≥1 frame behind its own `cut-flash` twin, in every legal implementation**, unless someone states the rule. At 60fps that is a 16.7ms visible split on a one-frame flash — the flash is over before the particles start. Same argument for `seam-flash`: AD-5 promises it is retained under reduced motion so "the hero beat stays marked," but if it is a bus event drained on the next frame while the seam's `charge-glow` is CSS on the snapshot, the mark is two events at two times.

**Tightening required.** A new AD fixing the **transition side-effect order as a single normative sequence**: (1) compute the next state; (2) call `AudioPort`; (3) publish FX events; (4) emit the snapshot — and, critically, requiring **every `FxEvent` to be self-contained**: it carries its own resolved origin `{x,y}` (from *pre-transition* geometry), shard index, and any parameters `ParticleEngine` needs, so `ParticleEngine` never reads the snapshot or `ShardGeometry` and cannot observe a shard that no longer exists. Then state the frame contract: `ParticleEngine` drains and spawns in the **same** frame in which `DomView` applied the corresponding snapshot, which follows from H-7's epoch rule.

---

## HIGH

### H-9 — Push vs pull on the EffectBus decides whether FR-9 exists at all

**Pair:** S-L (`EffectBus`) vs S-E (`ParticleEngine`).

AD-9 fixes capacity (4) and eviction (drop-oldest) but never says how a subscriber receives events. The diagram's `bus -.->|subscribe| engine` reads as push. Two legal builds:

- *Push*: S-L calls subscribers synchronously at publish time. A synchronous subscriber drains the queue immediately, so **depth never exceeds 1 and drop-oldest never fires.** The capacity-4 bound becomes decorative, and FR-9 — "when full, oldest drops," validated by SM-3 — is not implemented in any observable way. S-L's declared unit test (`effect-bus.test.ts`) passes anyway, because it tests the queue in isolation with no subscriber.
- *Pull*: S-E drains in its rAF tick. Capacity now matters, and H-8's frame skew becomes permanent. And the drain quantity is itself unspecified: "sheds particles rather than frames when over budget" (AD-18) legitimises **draining one event per frame** under load, which makes drop-oldest reachable and can evict a queued `seam-flash` behind older `shard-eliminate` events — the exact loss AD-9's own final sentence forbids ("Nothing required by FR-4, FR-5, or FR-8 may be routed through the `EffectBus`") while AD-9's event list routes `seam-flash` through it, and AD-5 states it may "**never**" be suppressed.

So AD-9 contradicts itself on `seam-flash`: it is on the lossy bus and simultaneously un-droppable.

**Tightening required.** AD-9 must state the delivery model — recommend pull, drained **fully** once per `ParticleEngine` frame, with backpressure expressed as particle count per event rather than events dropped at drain — and resolve the `seam-flash` contradiction. The clean resolution is to move `seam-flash` off the bus entirely and make it a one-frame CSS state on the seam element, exactly as `cut-flash` already is and for exactly the reason AD-9 already gives, leaving the bus with two events and its "nothing required goes on the bus" sentence finally true.

### H-10 — Nobody owns focus traversal, and AD-13 creates a re-entrant dispatch

**Pair:** S-G (KeyboardAdapter) vs S-D (DomView).

AD-15 enumerates the KeyboardAdapter's keys — `Enter`/`Space`, `Delete`/`Backspace`, plus `blur`/`visibilitychange` — and **omits `Tab` entirely**, while the UX Keyboard floor requires `Tab`/`Shift+Tab` to move focus between shards and AD-8 calls `focusedShardId` "keyboard-set." `FOCUS_SET` exists in the intent set and in the lock table with no stated producer.

- S-G(a): don't handle `Tab` (it's not in AD-15's list); rely on native focus order over the `tabindex` elements S-D renders, and translate the browser's `focusin` into `FOCUS_SET`. But S-G may not observe events on S-D's elements without a reference to them, and AD-1 forbids adapter→adapter imports (see H-14) — so S-G attaches a delegated `focusin` on the mount root, resolving the shard id from `event.target`'s data attribute. Legal.
- S-G(b): intercept `Tab`, `preventDefault`, compute the next shard from the snapshot's shard order, dispatch `FOCUS_SET`. Legal, and closer to "keyboard-set."
- S-D, meanwhile, is required by AD-13 to "re-appl[y] DOM focus after `redistributing` completes" — i.e. S-D calls `element.focus()` from inside a snapshot callback.

Two compositions break:

1. **S-G(b) + S-D's `tabindex` elements**: `Tab` moves FSM focus by one *and* the browser moves DOM focus by one (if `preventDefault` misses, e.g. the event arrives on the mount root after the shard already handled it), so the ring skips a shard. Or S-G(b) `preventDefault`s and S-D never applies DOM focus for the normal path (AD-13 only requires re-applying it after `redistributing`), so **DOM focus stays on the document body** and the browser's own focus, screen-reader cursor, and the FSM's `focusedShardId` diverge permanently — the accessibility floor is a painted ring with no real focus behind it.
2. **S-G(a) + AD-13**: S-D's `element.focus()` inside the snapshot callback fires `focusin` synchronously → S-G(a)'s delegated handler dispatches `FOCUS_SET` → the FSM mutates and emits a new snapshot **while S-D is mid-pass inside the previous one**. That is a re-entrant dispatch from inside a snapshot callback, which the Consistency Conventions ban outright ("Subscribers must not dispatch synchronously from inside a snapshot callback") — and the ban is violated by two units each obeying its own AD, not by carelessness.

**Tightening required.** AD-15 must be extended to own `Tab`/`Shift+Tab` explicitly, and one owner must be named for the DOM-focus/`focusedShardId` relationship. Recommended: `focusedShardId` is the single truth, `KeyboardAdapter` intercepts `Tab` and dispatches `FOCUS_SET`, `DomView` applies `element.focus()` on **every** snapshot where `focusedShardId` changed (not only after `redistributing`), and `KeyboardAdapter` listens for **no** focus events at all. Then add to AD-13 or the Conventions: DomView's `.focus()` call must be guarded so a resulting `focusin` cannot produce an intent, and re-entrancy protection is the FSM's responsibility — `dispatch()` called during snapshot emission must queue, not recurse.

### H-11 — `FOCUS_SET` has no arrow in the state chart, so the focus ring may never render

**Pair:** S-B/S-C (FSM) vs S-D (DomView).

AD-18's Rule: "the FSM emits a snapshot **only on a transition**." The state chart draws every `PREVIEW_SET` outcome including the self-transition `hovering --> hovering`, and draws **no arrow at all for `FOCUS_SET`**, which appears only as an accepted intent in the lock table for `idle` and `hovering`.

- S-B(a) reads "transition" as "phase change." `FOCUS_SET` changes `focusedShardId` but not `phase`, so it is not a transition, so **no snapshot is emitted.** Defensible directly from AD-18 and from the chart's silence.
- S-D renders the focus ring from `snapshot.focusedShardId` (AD-8). It never receives one.

Result: the entire keyboard floor is invisible. `Tab` produces no ring; the user holds `Enter` on a shard they cannot see is selected. Both units pass their own acceptance criteria — S-B's core tests assert `focusedShardId` moved, which it did.

Same reading also swallows AD-12's `previewMode` coercion (a field change with no phase change) and AD-13's focus relocation after an eliminate if that lands as a field-only update.

**Tightening required.** One sentence in AD-18 or AD-2: "A transition is any change to any snapshot field, not only to `phase`. Snapshot identity changes ⇒ emission. The FSM emits exactly one snapshot per `dispatch()` that changed state, and none for a dropped or refused intent." Add `idle --> idle : FOCUS_SET` and `hovering --> hovering : FOCUS_SET` to the chart so the omission cannot be read as intent.

### H-12 — The seam has zero owners

**Pair:** S-D (must brighten the seam) vs S-E (must originate `seam-flash` there), against S-A's declared output.

AD-6 fixes `ShardGeometry`'s output set: "polygons, centroids, unit outward normals, and the rim-band inset path." **No seam geometry, and no node centre.** Yet:

- The UX `Committing` row requires "seam brightens to `{colors.charge-glow}` for `{motion.seam-flash}`" — S-D needs a seam *element* with a path.
- AD-9/the lock table make `seam-flash` an FX event on the bus at `fuse-magnetize` elapsed — S-E needs a seam *locus* to draw at.
- The UX Component Patterns require "Binary uses a single seam; 3+ radiate from center" — a seam is a first-class visual, not an incidental gap.

Both units must therefore invent it, and AD-6 forbids exactly that ("No other module computes shard geometry"). Divergence: S-D derives the seam as the shared edge between adjacent polygons `i`/`i+1` and renders n paths; S-E resolves the `seam-flash` origin from the AD-4 centroid fallback, which for a node-wide event is *some shard's* centroid, not the seam. **The flash and its particles appear in different places on the hero frame** — and S-D has violated AD-6 to get there.

**Tightening required.** Extend AD-6's declared output to include `seams: readonly Segment[]` (or a single seam path for the binary layout) and `nodeCenter`, and state that `seam-flash`'s FX origin is the node centre, not a shard centroid. Add to AD-4: the centroid fallback applies only to shard-scoped events; node-scoped events (`shard-commit` at the fused node, `seam-flash`) resolve to `nodeCenter`.

### H-13 — The cached rect is stale after scroll, and two ResizeObservers race

**Pair:** S-J (`VoidCanvas`) vs S-F (`PointerAdapter`).

AD-6: the client rect "is cached and re-read only when a dirty flag set by `ResizeObserver` says so, never once per pointer event." AD-17: "on host resize **or scroll**, the pointer adapter re-hit-tests its cached last client position."

`ResizeObserver` does not fire on scroll, and scrolling changes `getBoundingClientRect()`'s client-space origin without changing any observed box. So after any scroll of the host page — an embedded portfolio shell is exactly the scrolling case AD-14 exists to support — **S-J's cached rect is stale and no dirty flag is set**, and every client→local conversion is off by the scroll delta. The FX origin `at` lands somewhere else on the canvas; on a long portfolio page the offset exceeds the node radius and every burst appears outside the node.

Compounding it: AD-17 makes S-F responsible for reacting to resize, and AD-1 forbids S-F from importing S-J. So S-F installs its **own** `ResizeObserver`/`scroll` listener. Now two observers fire with an ordering determined by registration order, which AD-14 never fixes (it names `mountMindVoid` as the wiring site but does not order construction). If S-F's handler runs first, it re-hit-tests and converts using S-J's **not-yet-invalidated** rect and dispatches a `PREVIEW_SET` for the wrong shard — worse than not resyncing at all, because AD-3 forbids S-F from gating and the FSM has no way to distinguish a bogus preview from a real one.

**Tightening required.** AD-6 must add `scroll` (capture-phase, on `window`, and on any scrollable ancestor) to the dirty-flag triggers, or drop rect caching in favour of a rect read lazily once per *frame* with a dirty flag set by both `ResizeObserver` and `scroll`. And a single **geometry-dirty notification owned by `VoidCanvas`** must be declared, with `mountMindVoid` subscribing `PointerAdapter` to it (see H-14) — so there is exactly one observer, one invalidation, and a defined order: invalidate rect → notify subscribers → resync preview.

### H-14 — The `VoidCanvas` handoff is not one of AD-1's three channels

**Pair:** S-F (needs the client→local transform) and S-D (needs the SVG layer element) vs S-J.

AD-1: "No adapter imports another adapter — adapters communicate only through intents, the snapshot, and the ports." `VoidCanvas` is listed in the adapter ring. But AD-6 makes `VoidCanvas` the sole holder of the client→local transform, which `PointerAdapter` needs for the `at` hint and for AD-17's re-hit-test; and AD-7 makes `DomView` the renderer of shard paths into a layer that `void-canvas.ts` ("layer scaffold") creates. Neither dependency is an intent, a snapshot, or a port.

The intended read is surely "`mountMindVoid` passes `VoidCanvas`'s outputs in as constructor arguments," which AD-14 permits — but the *shape* of those outputs is unspecified, and the two shapes are not interchangeable:

- S-J(a) exposes `toLocal(clientX, clientY): Point` and hands it to S-F. One implementation of the conversion.
- S-J(b) exposes `getRect(): DOMRect` — honouring AD-6's letter, since only S-J called `getBoundingClientRect` — and leaves the subtraction to callers. Now **S-F and any second consumer each implement the conversion**, and they will diverge on the things that actually matter: CSS border/padding on the root, `box-sizing`, scroll offset (H-13), and DPR. AD-6's "single geometry owner" is honoured on paper while the transform is duplicated.

S-D has the mirror problem: it can be handed the layer element, or handed the root and left to `querySelector` for the layer — in which case S-D depends on S-J's internal DOM structure with no contract, and the "rendering layers, bottom to top" list becomes a shared secret rather than an owned interface.

**Tightening required.** Amend AD-1's channel list to a fourth: "values injected by the composition root." Then declare `VoidCanvas`'s public surface explicitly in AD-6 — `layers: { vignette, shards, fx, text }`, `toLocal(clientX, clientY): Point`, `onGeometryDirty(fn): Unsubscribe`, `fxContext: CanvasRenderingContext2D` — and state that `DomView`, `PointerAdapter`, and `ParticleEngine` receive only these values and never the root element, never a selector, and never `VoidCanvas` itself.

### H-15 — Unmount disposes neither the FSM nor the Clock, and one throw can lock a phase forever

**Pair:** S-K (`mountMindVoid` unmount) vs S-N (copy lifecycle) / S-B (in-flight phase timer).

AD-14's unmount handle "detaches every listener, cancels the rAF loop, clears the bus, and stops audio." Four things — and neither the FSM nor the `Clock` is among them. Meanwhile AD-20 has `DomView` scheduling a `thesis-hold` callback on the same injected `Clock`, and AD-5 has the FSM holding an in-flight phase timer for up to 580ms.

- Unmount at 200ms into `committing`: S-B's phase timer is still pending. If S-K's "cancels the rAF loop" is read as "`ParticleEngine`'s loop" (which is what AD-18 calls *the* rAF loop), `RafClock` keeps running, the callback fires, the FSM transitions to `solid`, calls `AudioPort.commit-chord` on a stopped port, and emits a snapshot to a detached `DomView`.
- S-N's `thesis-hold` callback fires seconds after unmount. If S-D held element references, the writes are harmless; if S-D re-queries through the root (a legal choice — see H-14), the root is gone and the callback **throws**.
- S-I has no stated obligation to isolate subscriber throws. The Errors row says "a port failure is swallowed **by the port itself**" — `RafClock` *is* a port, so arguably it should wrap callbacks, but nothing says so, and the natural implementation is `for (const t of due) t.fn()`. **One throw from any Clock subscriber aborts the loop for every other subscriber.** Combined with the Errors row's own promise — "must never break the render loop or leave a phase locked; the injected `Clock` is the only thing that unlocks a phase" — a single throw from DomView's copy timer permanently locks whatever phase the FSM is in. The demo freezes mid-eliminate with input locked and no recovery path, which is the exact outcome that row forbids.

Also unspecified: unmount **order**. S-K may detach listeners last, so a `pointerdown` between clearing the bus and detaching dispatches an intent into a half-torn graph.

**Tightening required.** AD-14 must enumerate unmount as an **ordered** sequence and add the two missing steps: (1) detach all DOM listeners; (2) `clock.dispose()` — cancelling every pending callback from every subscriber; (3) `fsm.dispose()` — after which `dispatch()` is a no-op and no snapshot is ever emitted; (4) cancel the rAF render loop; (5) clear the bus and drop subscriptions; (6) stop audio. And add to the Errors row: the `Clock` invokes each callback in isolation and swallows throws, so no subscriber can stop time for another.

### H-16 — `pressedShardId`'s clear time decides whether the cancel-rewind exists

**Pair:** S-B (FSM: when is `pressedShardId` cleared?) vs S-D (renders the perimeter progress from it).

AD-8 says `pressedShardId` is "set on `HOLD_START`" and never says when it is cleared. FR-7 and the UX Hold-progress row require that leaving the shard "cancels **and rewinds**."

- S-B(a): clear on any exit from `pressing`. Then S-D, which renders the ring "from the third field," has `pressedShardId === null` at the instant the rewind should begin. If S-D renders the ring conditionally (element present only while pressed) the ring is **removed from the DOM** and nothing rewinds — the progress snaps away. To rewind, S-D would have to keep its own "was pressing, now rewinding" flag, and whether that is legal display state (per AD-20's precedent) or a banned second store of interaction state (per AD-2's "adapter-local flags") is genuinely ambiguous in the spine — two reviewers will rule differently.
- S-B(b): keep `pressedShardId` until the next `HOLD_START`, and let `phase` distinguish pressing from rewinding. Then S-D can transition the ring back, but a stale `pressedShardId` persists into `idle`/`hovering` and any S-D that keys the ring on the field alone leaves a full ring drawn on an unpressed shard.

Independently, S-D's own fill mechanism decides the outcome: a 400ms `@keyframes` animation on `stroke-dashoffset` (the natural way to express "fills over `hold-commit`") **snaps to its start value the instant the class is removed** — no rewind, ever — whereas a `transition` on `stroke-dashoffset` with the target set on class-add rewinds correctly from wherever it got to. Both are ordinary CSS. Only one satisfies FR-7.

**Tightening required.** AD-8 must state `pressedShardId`'s full lifetime (set on `HOLD_START`, cleared on the transition out of `pressing`) **and** add a rendering rule: the hold progress is expressed as a CSS *transition* toward a target driven by a `data-pressed` attribute plus the `--mv-hold-commit` duration, never a keyframe animation, precisely so that cancellation rewinds from the current value without any adapter-local state. Then settle the AD-2/AD-20 ambiguity with one sentence: transient rendering state that is a pure function of the snapshot plus CSS is DomView's; anything an intent can read back is the FSM's.

---

## MEDIUM

### H-17 — Durations have two sources: the generated CSS and DomView

**Pair:** S-M (`gen-tokens.ts`) vs S-D (writes custom properties).

AD-16: "`DESIGN.md` frontmatter is the authority. One generated artifact per consumer — CSS custom properties for paint, a TypeScript `MotionProfile` for timing… No colour, **duration**, or spacing literal appears anywhere else in the source." AD-5: "DomView consumes the identical values as CSS custom properties on the mount root."

S-M reads "the tokens are generated into `tokens.generated.css`" and emits `--mv-eliminate-dissolve: 220ms` there — durations are tokens, and the file is the token artifact. S-D reads AD-5 and writes the same properties inline from the injected `MotionProfile`. **Two writers of one value**, which is the exact drift AD-5's Prevents clause names ("CSS and the FSM each owning a duration"). It happens to work while both derive from the same generator, and breaks the moment reduced motion enters: AD-16 forbids "overridden CSS," so `tokens.generated.css` can only hold one profile's durations, and whether the inline write wins depends on selector specificity and on whether S-D writes to the mount root or a child.

**Tightening required.** AD-16 must split the token space explicitly: `tokens.generated.css` contains **paint and spacing only, zero duration declarations**; every duration reaches CSS exclusively as a custom property written by DomView from the injected `MotionProfile`, including the CSS-only values (`preview-in`, `preview-out`, `pulse-idle`) and the non-duration switches (idle pulse, ambient drift, settle overshoot), which DomView writes as `data-*` attributes. State that a `prefers-reduced-motion` media query must not appear in any stylesheet.

### H-18 — The text layer's `pointer-events` is unspecified and can kill the product

**Pair:** S-D (owns the text layer, AD-20) vs S-F (relies on `event.target` carrying a shard id, AD-7).

The rendering-layers list declares four layers bottom-to-top and specifies `pointer-events: none` for **only one** of them — the FX canvas. The text layer is topmost and carries the hint, thesis, and architecture credit.

S-D legally implements the text layer as a full-bleed absolutely-positioned container with its three children positioned inside it (bottom-centre, bottom-right). That container now covers the whole mount root **above** the SVG shard layer, so `event.target` on every `pointermove` is the text container, which carries no `data-shard-id`. S-F, per AD-7, does no arithmetic and performs no fallback — it resolves the zone from `event.target` and finds none, so it dispatches `PREVIEW_SET neutral` forever. **No preview, no press, no eliminate: the demo is completely inert**, and both units are AD-compliant. The narrower version bites even with tightly-sized text elements: the architecture credit sits bottom-right and "stays in frame for the closing still" (UJ-2), so a pointer crossing it loses its preview.

**Tightening required.** Extend the rendering-layers paragraph into a normative table with a `pointer-events` column: vignette `none`, shard layer `auto` (the only hit-tested layer), FX canvas `none`, text layer `none`. Add to AD-7: the shard layer is the only layer with `pointer-events: auto`; any element above it must set `none`, and `PointerAdapter` treats an `event.target` with no `data-shard-id` as `neutral` — which is only correct because nothing hit-testable can sit above the shards.

### H-19 — AD-17 and AD-19 contradict each other on coarse pointers

**Pair:** S-F's AD-17 resync path vs S-F's AD-19 coarse path — one module, two Rules, and the composition is observable.

AD-19: "under `pointer: coarse` the adapter emits **no `PREVIEW_SET` at all** — there is no hover, so `hovering` is unreachable." AD-17: "on leaving a locked phase, and on host resize or scroll, the pointer adapter re-hit-tests its cached last client position and dispatches a fresh `PREVIEW_SET` — `neutral` included," with no coarse exemption.

If the resync is implemented unconditionally (the literal AD-17 read), a touch user who taps a rim to eliminate gets a `PREVIEW_SET solo` at the end of `redistributing` from the cached tap position. `hovering` becomes reachable on coarse, contradicting AD-19's stated basis for `idle --> pressing`, and — because coarse emits no further `PREVIEW_SET` ever — the **Solo face treatment sticks permanently** on whichever shard the last tap landed near. The touch visitor sees one shard glowing forever with no way to clear it.

Second, narrower divergence in the same story: AD-19 keys on `pointer: coarse`, which reports the **primary** pointer. A touchscreen laptop reports `pointer: fine` + `any-pointer: coarse`, so S-F evaluating `matchMedia('(pointer: coarse)')` at construction hands the *hover* path to a finger, while an S-F branching per event on `event.pointerType === 'touch'` hands it the coarse path. The two produce different intent streams from identical user gestures on the same device.

**Tightening required.** Add to AD-17: "AD-17 does not apply when AD-19's coarse path is active; a coarse adapter never dispatches `PREVIEW_SET`, including for resync." And state which signal selects the path — recommend per-event `event.pointerType`, evaluated live, so hybrid devices get the correct path per gesture rather than per session, with `matchMedia` used only to decide whether the cursor channel exists.

### H-20 — `neutral` is an undeclared third preview mode with undefined companion fields

**Pair:** S-F (produces it) vs S-D (renders it), with S-C's AD-12 coercion in between.

AD-7 declares the mode set as two: "the core knows preview *modes* (`solo` = commit-oriented, `mute` = eliminate-oriented)". AD-12 and AD-17 both use a third, `neutral`, which is never added to the set. And AD-8's snapshot pairs `previewShardId` with `previewMode` without saying how they relate when the mode is `neutral`:

- S-F sends `PREVIEW_SET { shardId: null, mode: 'neutral' }` on leaving the node — but on the AD-12 binary floor, the rim hover it sends is `{ shardId: 'shard-a', mode: 'mute' }` and S-C coerces the **mode** to `neutral` while AD-12 says nothing about the **id**.
- S-C(a) keeps `previewShardId = 'shard-a'` with `mode: 'neutral'`. S-D, keying any highlight on a non-null `previewShardId`, renders a neutral hover-lift on the shard.
- S-C(b) nulls the id along with the mode. S-D renders nothing.

AD-12's Prevents clause wants "no highlight, no repulse cursor, and no `eliminate-cut`" — so (b) is intended — but (a) is legal and the two produce visibly different binary-node behaviour on the rim, which is the most-hovered region of the two-shard endgame. And because `{ shardId: non-null, mode: 'neutral' }` versus `{ shardId: null, mode: 'neutral' }` are two different states with one name, `hovering` entry (`idle --> hovering : PREVIEW_SET solo|mute`) is ambiguous under coercion: does the FSM enter `hovering` for a coerced-neutral rim hover, or stay in `idle`? That determines whether `CANCEL` is accepted there.

**Tightening required.** Declare the mode set as exactly `solo | mute | neutral` in AD-7 (or AD-8) with the invariant stated as a biconditional: `previewMode === 'neutral'` **iff** `previewShardId === null`. AD-12's coercion then necessarily clears both, and `hovering` is unambiguously not entered. One sentence removes the whole class.

### H-21 — Canonical geometry and animated geometry are never reconciled

**Pair:** S-F (produces `at` from client coordinates — animated space) vs S-E (falls back to a `ShardGeometry` centroid — canonical, final space).

AD-6 makes `ShardGeometry` the only truth about where a shard is, and forbids recovering position from the DOM. But during `redistributing` and `committing` the shards are visually somewhere else — mid-CSS-transition — and SVG hit-testing honours the animated transform. So there are two answers to "where is shard 2 right now," and the spine designates only one as legal while the browser uses the other.

Demonstrated: AD-17's resync at the end of `redistributing` uses `elementFromPoint`-style hit resolution against the **animated** position (one frame behind final, per H-7(b)), producing a `PREVIEW_SET` for a shard whose canonical position differs. If the user then triggers `ELIMINATE`, S-F attaches `at` from the pointer (animated space) while a keyboard `ELIMINATE` one moment later resolves the centroid (final space) — the two FX bursts for the same shard originate up to the full redistribute travel apart. Neither unit is wrong; they are answering different questions with the same field.

**Tightening required.** State the reconciliation rule in AD-6: canonical geometry is authoritative, animated position is presentational only, and **no intent may be produced from a position captured while `phase` was locked**. Concretely, AD-17's resync must run on the first frame *after* the unlock snapshot has been applied (H-7's epoch), and the FX origin for any event resolved during or immediately after a locked phase must use the canonical centroid rather than a cached client position.

---

## Summary table

| # | Hole | Pair | Severity |
|---|---|---|---|
| H-1 | Audio bed never starts (hover ≠ user activation; `bed-start` emitted once) | S-B ↔ S-H | critical |
| H-2 | Rim clicks never eliminate (fine-path event mapping unspecified + refuse-while-`pressing`) | S-F ↔ S-B | critical |
| H-3 | `redistributing` has no legal animation mechanism; 3→2 switches layout family | S-D ↔ S-A | critical |
| H-4 | Body→rim move during `pressing` is unspecified; hero hold cancels at random | S-F ↔ S-B | critical |
| H-5 | Two coordinate origins in one field; plus unowned canvas sizing/DPR | S-A ↔ S-J → S-E | critical |
| H-6 | `HOLD_START` target: adapter-supplied id vs FSM's focused shard → wrong winner | S-G/S-F ↔ S-B | critical |
| H-7 | `Clock` port undefined: no cancel, no epoch, no tick, no catch-up, two rAF loops | S-I ↔ S-B/S-C | high |
| H-8 | Transition side-effect order undefined; `cut-flash` and its burst desync by a frame | S-D ↔ S-E | high |
| H-9 | Push vs pull bus drain decides whether FR-9 exists; `seam-flash` both lossy and required | S-L ↔ S-E | high |
| H-10 | Nobody owns `Tab`; AD-13's `.focus()` causes a banned re-entrant dispatch | S-G ↔ S-D | high |
| H-11 | `FOCUS_SET` has no arrow; "snapshot only on a transition" can kill the focus ring | S-B ↔ S-D | high |
| H-12 | The seam has zero owners; flash and particles land apart, AD-6 gets violated | S-D ↔ S-E/S-A | high |
| H-13 | Rect stale after scroll; two ResizeObservers with no ordering | S-J ↔ S-F | high |
| H-14 | `VoidCanvas` handoff isn't an AD-1 channel; transform duplicated or DOM coupled | S-J ↔ S-F/S-D | high |
| H-15 | Unmount disposes neither FSM nor Clock; one throw locks a phase forever | S-K ↔ S-N/S-B | high |
| H-16 | `pressedShardId` clear time + keyframe-vs-transition → no cancel rewind | S-B ↔ S-D | high |
| H-17 | Durations written by both the generated CSS and DomView | S-M ↔ S-D | medium |
| H-18 | Text layer's `pointer-events` unspecified; full-bleed layer makes the demo inert | S-D ↔ S-F | medium |
| H-19 | AD-17 vs AD-19 contradict on coarse; Solo treatment sticks forever on touch | S-F ↔ S-F | medium |
| H-20 | `neutral` undeclared; `previewShardId` under AD-12 coercion undefined | S-F ↔ S-D | medium |
| H-21 | Canonical vs animated position never reconciled | S-F ↔ S-E | medium |

## What the spine is missing structurally

Three ADs' worth of decisions are absent, and sixteen of the twenty-one holes above collapse into them:

1. **An ordering AD.** The spine names owners but never sequences them. Needed: the transition side-effect order (H-8), self-contained FX events (H-8, H-5), the snapshot-emission trigger (H-11), the frame epoch (H-7b, H-21), re-entrancy handling for `dispatch` during emission (H-10), and the unmount sequence (H-15).
2. **A `Clock` port AD.** The single most-referenced collaborator in the document (AD-5, AD-18, AD-20, the lock table, the Errors row) has no declared interface. Needed: surface, cancellation with generation tokens, epoch, delta clamping, throw isolation, and its relationship to AD-18's "exactly one rAF loop" (H-7, H-15).
3. **A coordinate and layer AD.** Needed: one origin and axis direction for `ShardGeometry`, `nodeCenter` and `seams` in its output, the explicit `VoidCanvas` public surface, canvas DPR ownership, and a `pointer-events` column on the layer list (H-5, H-12, H-13, H-14, H-18, H-3's option (b)).

Everything else is a sentence: make `shardId` required (H-6), add the `pressing` self-transition (H-4), declare `neutral` (H-20), give `Tab` an owner (H-10), exempt coarse from AD-17 (H-19), specify the fine-pointer event map (H-2), latch `bed-start` (H-1), split duration tokens out of the CSS artifact (H-17), fix `pressedShardId`'s lifetime and the fill mechanism (H-16), and move `seam-flash` off the bus (H-9).

**Gate recommendation: do not hand off.** Six criticals each produce a silently broken required capability (FR-6, FR-7, FR-8) built by stories that pass their own acceptance criteria, and the declared test floor — core-only unit tests with an injected fake Clock, with DOM and e2e testing explicitly deferred — cannot detect any of them.
