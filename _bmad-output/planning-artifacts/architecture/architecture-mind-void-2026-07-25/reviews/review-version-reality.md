---
review: version-and-external-reality
target: ARCHITECTURE-SPINE.md (Mind Void)
lens: 'Was every committed decision web-researched or reality-checked, rather than asserted from training data?'
reviewed: '2026-07-25'
reviewer: pre-handoff gate reviewer
scope: 'factual currency and correctness of externally-verifiable claims ONLY — not architecture quality, structure, or style'
verdict: 'Version pins are exemplary and fully verified. Two of the three conclusions drawn from those facts are wrong, and the Web-platform layer was largely not reality-checked at all.'
---

# Review — Version & External Reality

## How this was verified

Every claim below was checked against a live primary source on 2026-07-25, not from recall:

- npm registry `dist-tags` endpoints and per-version packuments (`registry.npmjs.org`) for all version and peer-range claims
- `nodejs/Release` `schedule.json` (raw, `main` branch) for Node lifecycle dates
- The official Microsoft TypeScript 7.0 and 7.0 RC announcement posts for the compiler-API claim
- MDN, the CSSWG Resize Observer Level 1 editor's draft, W3C Pointer Events Level 3, SVG 1.1 §Interactivity, and caniuse for Web-platform behavior

Where a source contradicts the spine, the source is quoted.

---

## Part 1 — The Stack table

> The spine states: "Verified against the live registries on 2026-07-25."

**This line is honest.** All three pinned versions are exactly the current `latest` on npm. This is unusual and worth saying plainly, because it is the part of the document most likely to have been fabricated and it was not.

| Spine claim | Live registry (2026-07-25) | Result |
| --- | --- | --- |
| TypeScript 7.0.2 | `dist-tags.latest = 7.0.2` (`rc = 7.0.1-rc`, `next = 7.1.0-dev.20260725.1`, `beta = 6.0.0-beta`) | **Correct — current stable** |
| Vite 8.1.5 | `dist-tags.latest = 8.1.5` (`previous = 7.3.6`, `beta = 8.2.0-beta.0`) | **Correct — current stable** |
| Vitest 4.1.10 | `dist-tags.latest = 4.1.10` (`beta = 5.0.0-beta.7`) | **Correct — current stable** |
| Node.js 20.19+ / 22.12+ | `vite@8.1.5` `engines: { node: "^20.19.0 \|\| >=22.12.0" }` | **Exactly correct transcription** — see F6 for the caveat |
| UI framework: none | n/a | n/a |
| Runtime dependencies: none | n/a | n/a |

### Mutual compatibility — verified

- **Vitest 4.1.10 ↔ Vite 8.1.5.** `vitest@4.1.10` declares `peerDependencies: { "vite": "^6.0.0 || ^7.0.0 || ^8.0.0" }` and a matching non-optional `dependencies.vite` of the same range. Vite 8.1.5 satisfies it. **Compatible.**
- **Node floor is Vite's, and it is the binding one.** `vitest@4.1.10` declares `engines: { node: "^20.0.0 || ^22.0.0 || >=24.0.0" }`, which is *looser* at the bottom (20.0.0) than Vite's 20.19.0. Taking the intersection, the project floor is Vite's `20.19+ / 22.12+` — which is what the spine states. **Correct.** One narrow nuance: Vite permits Node 23 (`>=22.12.0`) while Vitest's engines exclude the 23.x line; irrelevant in practice since 23 is long EOL, and the spine's stated floor is unaffected.
- **Vite 8's own Node requirement is confirmed upstream**, not just inferred from `engines`. The Vite 8.0 announcement: "Vite 8 requires Node.js 20.19+, 22.12+, the same requirements as Vite 7. These ranges ensure Node.js supports `require(esm)` without a flag."
- **TypeScript 7 ↔ Vite 8 / Vitest 4 is a non-issue, and for a verifiable reason.** `vite@8.1.5`'s dependency set is `postcss`, `rolldown`, `picomatch`, `tinyglobby`, `lightningcss` — no `typescript`. `vitest@4.1.10` likewise has no `typescript` dependency or peer. Neither tool consumes the TypeScript library, so neither is affected by the 7.0 API removal. TypeScript's role here is `tsc --noEmit` only, and TS 7.0 does ship its own `tsc` binary (confirmed in the Microsoft announcement: "TypeScript 7.0 (which ships its own `tsc` binary)"). **The build and test path is genuinely clean under TS 7.**

So: the table itself is correct, real, current, and mutually compatible. The problems begin one paragraph later.

---

## Part 2 — The TypeScript 7 / compiler-API paragraph

> The spine states: "TypeScript 7.0 ships without the programmatic compiler API until 7.1, so no tool in this project may consume that API: `tsc --noEmit` is the type-check gate, and ESLint runs only rules that need no type information. The `@typescript/typescript6` bridge is therefore never required."

Three separate claims. The first two are **correct**. The third is **wrong**.

### Verified correct — the API gap

Quoting the official *Announcing TypeScript 7.0* post verbatim:

> "While TypeScript 7.0 is here, it does not ship with an API. We expect TypeScript 7.1 to ship with a new (and different) API, but until then we have made it a priority to ensure TypeScript can be run side-by-side with TypeScript 6.0 for utilities that still need some programmatic access to the compiler (such as typescript-eslint)."

The spine's framing is accurate, and its choice of `typescript-eslint` as the exemplar consumer is exactly the example Microsoft itself uses. Verified.

### Verified correct — the bridge package is real

`@typescript/typescript6` exists on npm and is not a hallucination:

- Current version **6.0.2**, published 2026-07-06; first published 2026-04-16
- Publisher: Microsoft Corp., Apache-2.0, repo `github.com/microsoft/TypeScript`
- Sole dependency: `@typescript/old: npm:typescript@^6` — i.e. it is an alias wrapper
- Its README: "This package provides a `tsc6` command that runs TypeScript 6's `tsc`. It also reexports the TypeScript 6 API"
- ~2.17M weekly downloads

The package name, its purpose, the `tsc6` binary, and the API re-export are all **exactly as the spine describes**. Verified.

### F1 — HIGH — "The bridge is therefore never required" is false if ESLint lints TypeScript

The spine reasons that because it only enables ESLint rules that need no type information, it avoids the compiler API and therefore needs no bridge. **Both halves of that inference fail.**

**(a) Peer resolution is version-based, not rule-based.** Current `typescript-eslint@8.65.0` declares:

```json
"peerDependencies": {
  "eslint": "^8.57.0 || ^9.0.0 || ^10.0.0",
  "typescript": ">=4.8.4 <6.1.0"
}
```

`@typescript-eslint/typescript-estree@8.65.0` declares the same `typescript` range as a **non-optional** peer (no `peerDependenciesMeta` entry relaxing it). `typescript@7.0.2` does not satisfy `>=4.8.4 <6.1.0`. This is an install-time `ERESOLVE` failure, and **which rules you enable has no bearing on it** — the package manager resolves peers before ESLint ever reads a config. Disabling type-aware rules cannot avoid this.

**(b) The parser itself is a compiler-API consumer.** `@typescript-eslint/typescript-estree` uses the TypeScript library to parse `.ts` source into an ESTree AST. That is true with *zero* type-aware rules enabled — the compiler API is needed for parsing, not only for type information. So "ESLint runs only rules that need no type information" does not put the project outside the set of compiler-API consumers. Corroborated by the independent reports: forcing the install past `ERESOLVE` produces a crash inside `typescript-estree` (`TypeError: Cannot read properties of undefined (reading 'Cjs')`), and the typescript-eslint issue requesting TS 7 support was closed as *not planned* because the fix is on Microsoft's side.

**Consequence.** On day one of setup, `npm install` fails. The spine's stated conclusion is the opposite of the truth: for this project, if the linter is ESLint + typescript-eslint, `@typescript/typescript6` is **required**, via exactly the alias arrangement Microsoft documents:

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

**Options, all of which are decisions the spine has not made:** (i) adopt the alias bridge and delete the "never required" sentence; (ii) switch to a linter that does not consume the TypeScript API — oxlint or Biome — and say so; (iii) drop TS-aware linting entirely. Any of these is defensible; asserting the problem away is not.

### F7 — MEDIUM — The Stack table pins no linter, yet a paragraph beneath it makes a load-bearing claim about one

The table pins TypeScript, Vite, Vitest, and Node. It does not pin **ESLint**, **typescript-eslint**, or **`@types/node`** — yet the very next paragraph commits the project to an ESLint policy, and that policy is the one that is factually wrong (F1). An unpinned tool carrying a load-bearing external claim is unverified by construction. For reference, current ESLint-side reality: `typescript-eslint` latest is `8.65.0`, peering `eslint@^8.57.0 || ^9.0.0 || ^10.0.0`.

Relatedly, `scripts/gen-tokens.ts` in the Structural Seed is a TypeScript file intended to be *executed* at build time, which requires a TS-executing runner — `tsx`, `vite-node`, or Node's native type stripping. None is named or pinned. Note `vite@8.1.5` lists `tsx` and `jiti` only as **optional** peers, so nothing installs one for you.

### F12 — LOW — TypeScript 7.0's changed defaults are unstated

The spine treats `tsc --noEmit` as a settled non-decision. Per the official 7.0 announcement, 7.0 "adopts 6.0's new defaults, and provides hard errors in the face of any flags and constructs deprecated in TypeScript 6.0":

- `strict` is `true` by default; `module` defaults to `esnext`; `target` defaults to the stable ECMAScript version preceding `esnext`; `noUncheckedSideEffectImports` is `true`; `libReplacement` is `false`
- Removed as hard errors: `target: es5`, `downlevelIteration`, `moduleResolution: node`/`node10`/`classic`, `module: amd|umd|systemjs|none`, `baseUrl`, `esModuleInterop: false`, `alwaysStrict: false`

For greenfield code this is mostly benign — but it means a Vite project must use `moduleResolution: "bundler"` (or `nodenext`), and the older `node`-style resolution many templates still carry is now an error. Worth one line in the spine rather than a discovery during setup.

### F13 — LOW — "until 7.1" is firmer than the source

Microsoft's wording is hedged: "We **expect** TypeScript 7.1 to ship with a new (**and different**) API." Two things follow that the spine's phrasing obscures: 7.1 is unreleased and undated (npm `next` today is `7.1.0-dev.20260725.1`), and the returning API is explicitly a *new and different* surface, not the old one restored. So 7.1 is not a scheduled unblock that consumers can plan a port against; third-party estimates of "~October 2026" are inferred from the 3–4 month cadence, not committed by Microsoft.

---

## Part 3 — The Web APIs

The spine chooses vanilla TypeScript, so the Web platform *is* its framework. Checked each API named in the review brief.

**First, the direct answer on deprecation: none of these APIs is deprecated or non-standard in 2026.** `ResizeObserver`, Pointer Events (incl. `setPointerCapture`), SVG `pointer-events`, `prefers-reduced-motion`, the `pointer` media feature, `AudioContext.resume()`, `visibilitychange`, and Canvas 2D are all current, standardized, and Baseline-available. `ResizeObserver.observe()` is "Baseline Widely available … since July 2020."

The problems are not deprecations. They are **behavioral and policy constraints** that the spine's rules collide with — and, notably, **three of the APIs in the brief are never mentioned in the spine at all**. A grep of the document for `setPointerCapture`, `pointercancel`, `touch-action`, `devicePixelRatio`, and `matchMedia` returns **zero hits**. That absence is itself the finding for F5 and F8: these are not claims that were checked and got wrong, they are load-bearing platform mechanics that were never considered.

### F2 — HIGH — AD-11's autoplay gate fires on an event that cannot grant user activation

AD-11 states: "The FSM emits `bed-start` once, on the first intent that reaches it in a session. The `AudioContext` is created lazily and resumed inside the port implementation … on failure the port silently no-ops."

For a mouse user, **the first intent that reaches the FSM is `PREVIEW_SET`**, dispatched from hover (`pointerover`/`pointermove`) per AD-4/AD-19 and the state chart's `idle --> hovering : PREVIEW_SET`. Hover cannot unlock audio.

MDN's user-activation reference defines an *activation triggering input event* as a trusted event of one of exactly these types:

- `keydown` (with exceptions), `mousedown`, `pointerdown` (if `pointerType` is `"mouse"`), `pointerup` (if `pointerType` is not `"mouse"`), `touchend`

`pointermove`, `pointerover`, and `mousemove` are **not** on that list. And the same reference lists "Autoplay of Media and Web Audio APIs (in particular for `AudioContexts`)" as gated on **sticky activation** — a window state that requires the user to have "at some time in the session pressed a button, used a menu," etc. A visitor who has only moved the mouse has never had sticky activation, so `resume()` is refused regardless of call-stack position. (Chrome's own diagnostic is the familiar "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page.")

**Chain of consequence, entirely inside the spine's own rules:**

1. First intent is `PREVIEW_SET` from hover → FSM emits `bed-start`
2. `WebAudioPort` creates the `AudioContext` and calls `resume()` → blocked, no sticky activation
3. AD-11: "on failure the port silently no-ops and shows nothing"
4. AD-11: `bed-start` is emitted **once** — there is no retry path
5. FR-8 ("Multi-sensory tension and release"), which AD-9 explicitly protects as a **lossless, mandatory** channel that may never be dropped, is silently dead for the entire session for any visitor who hovers before pressing — which is the common case for the primary desktop persona

This is the sharpest defect found: AD-9 goes to considerable lengths to guarantee the audio channel is lossless against bus eviction, and AD-11 then loses the whole channel to an autoplay policy. Additionally, iOS Safari requires `resume()` to be called *within the UI event handler's call stack*; resuming from a promise continuation or a later tick fails even with sticky activation, so the FSM→port call must remain synchronous with the originating gesture.

**Fix direction:** emit `bed-start` on the first intent that *can* carry activation (`HOLD_START` from `pointerdown`/`keydown`, or `ELIMINATE`), or make the port idempotently retry `resume()` on each subsequent qualifying gesture until the context reports `running`. Either way the "emitted once" rule in AD-11 needs amending, and `navigator.userActivation.hasBeenActive` is available if the port wants to check before trying.

### F3 — MEDIUM-HIGH — AD-6's rect cache cannot be invalidated by `ResizeObserver` alone

AD-6 states: "Only `VoidCanvas` calls `getBoundingClientRect` … the rect is cached and re-read only when a dirty flag set by `ResizeObserver` says so, never once per pointer event."

`getBoundingClientRect()` returns a **viewport-relative** rect, so its `x`/`y` change on scroll and on any ancestor transform or reflow that moves the element. `ResizeObserver` observes **size**, and will not fire for any of those. Per the CSSWG Resize Observer Level 1 draft, the observation fires when the element's size changes, when it is inserted/removed from the DOM, and when `display` becomes `none` — and explicitly: **"Observations will not be triggered by CSS transforms."** Nothing in the spec fires it for scroll or position changes.

Because that cached rect *is* the client→local transform for every pointer coordinate, a page scroll leaves the transform stale and offsets every subsequent hit-test and every FX origin by the scroll delta — and since the mount root is explicitly *not* assumed to equal the viewport (AD-14) and the demo is designed to be embedded in a portfolio shell, scrolling is the expected condition, not an edge case.

The spine half-knows this: **AD-17 already says the pointer adapter re-hit-tests "on host resize or scroll."** So the requirement is acknowledged in one rule while the mechanism named in another cannot deliver it. The two rules need reconciling: add a scroll listener (capture-phase on ancestors, or `scrollend`), or accept a per-event `getBoundingClientRect()` — which, contrary to the implication of "never once per pointer event," is a read of already-computed layout in the common case and is not obviously the bottleneck worth this much machinery.

### F4 — MEDIUM — `pointer: coarse` is a documented-unreliable discriminator, and AD-19 makes it decisive

AD-19 branches the entire input model on it: "under `pointer: coarse` the adapter emits no `PREVIEW_SET` at all — there is no hover, so `hovering` is unreachable."

The `pointer` and `hover` media features report only the **primary** pointing device, and their real-world accuracy is a known, tracked defect. MDN's browser-compat-data issue #24451 is titled, in full: *"css.at-rules.media.hover, css.at-rules.media.pointer — Inaccurate results on Android, ChromeOS, Safari on iOS, Windows."* From that issue:

> "**Safari on iOS**: always reports the primary pointing device is the touchscreen (`pointer: coarse, hover: none`), even when using hover-capable peripherals (Apple Pencil, Magic Keyboard, mouse), or using an external display in 'extended' mode (Stage Manager)."

And the converse case: a Windows touchscreen laptop reports `pointer: fine` because the trackpad is primary, while still receiving finger input.

So AD-19 produces two concrete wrong outcomes: an iPad-with-Magic-Keyboard visitor is permanently locked out of the Solo/Mute preview — the phase `hovering` is *unreachable* for them, per the rule's own wording — while a touchscreen-laptop visitor's finger taps are routed down the hover path that AD-19 exists to avoid. This also silently deletes FR-4/FR-5 preview treatments for a real class of device.

The reality-checked discriminator is **per-event `event.pointerType`** (`"mouse" | "pen" | "touch"`), which describes the input actually in use rather than a guess about the device, and is exactly what the media query cannot tell you. As a live precedent, tldraw PR #7404 — *"replace coarse pointer media queries with reactive data attribute"* — did this migration for this reason: "The media query approach was unreliable and didn't reset when switching between touch and mouse input." Note this is not a small edit to AD-19: it changes "coarse" from a mount-time static fact into reactive state, which touches AD-19, AD-10 (cursor channel absent on coarse), and the reachability of `hovering`.

### F5 — MEDIUM — A 400 ms touch hold is specified with no `touch-action` and no `pointercancel`

AD-19: "A touch on the body sends `HOLD_START` on `pointerdown` and `HOLD_END` on `pointerup`, so the 400ms hold still governs Commit."

Neither `touch-action` nor `pointercancel` nor `setPointerCapture` appears anywhere in the spine. All three are required for this to work on touch:

- **Viewport panning cannot be prevented by canceling the event.** W3C Pointer Events Level 3 is explicit: "viewport manipulations (panning and zooming) are intentionally NOT a default action of pointer events, meaning that these behaviors … **cannot be suppressed by canceling a pointer event.** Authors must instead use `touch-action` to explicitly declare the direct manipulation behavior for a region of the document." So `preventDefault()` will not save a 400 ms hold; only `touch-action: none` on the shard layer will.
- **When the UA takes over, `pointercancel` fires and `pointerup` never comes.** Per MDN, `pointercancel` fires "if after the `pointerdown` event is fired, the pointer is then used to manipulate the viewport by panning, zooming, or scrolling," and also on app switching, screen-orientation change, and palm rejection. Pointer Events L3 specifies the sequence: fire `pointercancel`, then `pointerout`, then `pointerleave`, and "implicitly release the pointer capture."

**Consequence in the spine's own state chart:** with no `pointercancel` handler, a touch hold that drifts a few pixels becomes a scroll; `pointerup` is never delivered, so no `HOLD_END` is dispatched. The FSM sits in `pressing`, from which the chart's only exits are `HOLD_END`, `PREVIEW_SET`, `CANCEL`, or "Clock reaches hold-commit" — and on a coarse pointer AD-19 emits no `PREVIEW_SET` at all. The likely outcome is therefore a **spurious Commit** the user never intended (the Clock reaches 400 ms while their finger has moved on to scrolling the page), which is the single most destructive action in the product. AD-15 carefully specifies `CANCEL` on `blur` and `visibilitychange` for the keyboard; the pointer adapter has no equivalent, and `pointercancel` is precisely it.

`setPointerCapture` is likewise absent, and it is the standard mechanism for keeping a hold alive when the pointer leaves the shard's bounds mid-press — relevant because the state chart deliberately distinguishes "releasing in place" from "releasing after leaving the shard," a distinction that is unreliable without capture.

### F8 — LOW-MEDIUM — Canvas backing store and `devicePixelRatio` are never addressed, and the obvious fix is not portable

The spine specifies an FX canvas and declares "all coordinates are numbers in VoidCanvas local CSS pixels," but never mentions `devicePixelRatio` or the canvas backing store. Two verified platform facts matter:

- Per MDN, `devicePixelRatio` **changes at runtime** — "Page zooming affects the value of `devicePixelRatio`" and it changes "if the user drags the window to a display with a different pixel density."
- A **`content-box` `ResizeObserver` will not fire on a DPR-only change**, because the CSS size is unchanged. Corroborated in practice by luma.gl PR #2676: "Since `content-box` won't fire when only DPR changes (CSS size stays the same during browser zoom), `_observeDevicePixelRatio` now recalculates and resizes the drawing buffer."

So under AD-6's ResizeObserver-only invalidation, browser zoom or a monitor change leaves the canvas backing store at the old scale — a permanently blurry or mis-scaled FX layer with no event to correct it.

**Caution on the fix, since this review's own standard applies to its recommendations:** the tempting answer, `ResizeObserver` with `box: 'device-pixel-content-box'` / `entry.devicePixelContentBoxSize`, is **not portable in 2026**. MDN labels it "**not Baseline** because it does not work in some of the most widely-used browsers," and caniuse shows Safari **unsupported through Safari 27 and iOS Safari 26.5** (Chromium 84+ and Firefox 108+ only). The portable approach is MDN's documented re-arming pattern: `matchMedia('(resolution: ' + devicePixelRatio + 'dppx)')` with a `change` listener that re-creates the query each time it fires.

### F9 — LOW — SVG hit-testing has two constraints AD-7 leans on without stating

AD-7 delegates zone resolution entirely to the browser: "Zone resolution is the browser's own hit test on `event.target`; the pointer adapter performs no distance or point-in-polygon arithmetic." Two verified SVG facts constrain that:

- **Unpainted regions are not hit-testable under the default.** Per MDN, `pointer-events` defaults to `visiblePainted` for SVG content, under which an element is a pointer target only when the pointer is over the **fill** and `fill` is *not* `none`, or over the **stroke** and `stroke` is *not* `none*`. AD-7's "rim-band inset path" is the exposure: if the rim band is drawn as an unfilled stroked path, only the painted stroke width is hit-testable, not the visual band; if it is a band path with `fill="none"`, it is invisible to hit-testing entirely. This is a real trap for the "rim above body" precedence the rule depends on, and the fix is a deliberate `pointer-events` value (`visibleFill`, `all`, or `bounding-box`) plus a non-`none` fill — a decision, not a default.
- **The outermost `<svg>`'s hit behavior is explicitly unspecified.** SVG 1.1 §Interactivity: "This specification does not define the behavior of pointer events on the outermost svg element for SVG images which are embedded by reference or inclusion within another document … the behavior is implementation-specific." In practice browsers treat the outermost `<svg>` in HTML as an ordinary CSS box that captures events across its whole border-box. So `event.target` for a pointer in the gap between shards will be the `<svg>` root or an intermediate `<g>`, not a shard. AD-7 needs a stated miss→`neutral` mapping (and, if listeners are attached at the root, an explicit "no `data-shard-id` ancestor ⇒ neutral" walk). The spine has a `neutral` preview mode, so this is likely a one-line clarification rather than a redesign — but as written the rule assumes `event.target` is always a shard element.

Positively: `pointer-events` as an SVG attribute and CSS property is current, standardized, and not deprecated, and using DOM hit-testing instead of hand-rolled point-in-polygon is well-founded.

### F10 — LOW — `prefers-reduced-motion` is read once, and the spine doesn't say that's a choice

AD-5: "`prefers-reduced-motion` selects a different `MotionProfile` **at mount**." The media feature is Baseline and uncontroversial, but it is a *live* query: users toggle the OS setting mid-session, and `matchMedia(...).addEventListener('change', …)` is the documented way to observe it. Reading it once at mount is a defensible simplification for a demo — but it is an unstated platform limitation presented as a neutral fact, and it means a visitor who enables reduced motion while the page is open keeps the full-motion profile until reload.

### F11 — LOW — `blur` and `visibilitychange` are correct but target different objects

AD-15: "sends `CANCEL` on `blur` and `visibilitychange`." Both APIs are current and non-deprecated, and pairing them is right in spirit — `visibilitychange` covers tab switching and backgrounding, `blur` covers same-page focus loss that does not change visibility. One mechanical note for implementation: `visibilitychange` fires on **`document`**, not `window`, so the two listeners attach to different targets; and per AD-14 both must be detachable by the unmount handle.

---

## Part 4 — Other unverified assertions about the outside world

### F6 — MEDIUM — The Node floor is an accurate transcription of an EOL runtime

The spine's `20.19+ / 22.12+` is exactly Vite 8.1.5's `engines`, so as a *transcription* it is correct (and credited above). But as **guidance dated 2026-07-25** it points CI at an unsupported runtime. From `nodejs/Release` `schedule.json`:

```json
"v20": { "start": "2023-04-18", "lts": "2023-10-24", "maintenance": "2024-10-22", "end": "2026-04-30", "codename": "Iron" }
```

**Node 20 reached end of life on 2026-04-30 — nearly three months before this spine was written.** No further security patches ship for the 20.x line; a CVE found now is fixed only in 22+. Current lifecycle: **Node 22** is Maintenance LTS (`end: 2027-04-30`), **Node 24** is Active LTS (`end: 2028-04-30`), **Node 26** released 2026-05-05 and enters LTS 2026-10-28.

Vite's own release policy explains why the 20 floor lingers — "Major releases generally align with Node.js EOL schedule" and Vite 8 deliberately kept Vite 7's range — so the floor is Vite being conservative, not a recommendation. The spine should state the *supported* build target (Node 22.12+, preferably 24 LTS) and cite 20.19 only as the tool's permissive minimum. As written, a reader provisioning CI from this table will pick Node 20.

### Also checked, no finding

- **`vite build` → static deployable folder; no server/backend/datastore.** Consistent with Vite 8; nothing to flag.
- **"Runtime dependencies: none."** Consistent with the vanilla-TS choice; Vite's dependencies are build-time only.
- **Deferred: "WebGL or WebGPU is a `ParticleEngine`-internal swap."** Framed as explicitly not needed for v1, so it makes no live compatibility claim. Left alone. (Had it been load-bearing, WebGPU's cross-browser status would need checking.)
- **Vite 8.1 is a supported line.** Vite's releases page confirms "Regular patches are released for `vite@8.1`," so 8.1.5 is on the actively-patched branch, not a stale minor.
- **`@types/node` is unpinned.** `vite@8.1.5` lists it as an *optional* peer at `^20.19.0 || >=22.12.0`. Only worth a line if the build scripts need Node globals; noted under F7.

---

## Summary table

| # | Severity | Finding |
| --- | --- | --- |
| F1 | **High** | "`@typescript/typescript6` bridge never required" is false: `typescript-eslint@8.65.0` peers `typescript ">=4.8.4 <6.1.0"`, so TS 7.0.2 fails at install regardless of which rules are enabled — and `typescript-estree` consumes the compiler API to *parse*, not only to type-check |
| F2 | **High** | AD-11 fires `bed-start` on the first intent, which for a mouse user is hover — `pointermove` is not an activation-triggering event and Web Audio needs sticky activation, so `resume()` is refused, the port silently no-ops, and the once-only emission never retries, killing the mandatory FR-8 channel |
| F3 | Medium-High | AD-6 invalidates the cached `getBoundingClientRect` only via `ResizeObserver`, which per spec never fires on scroll, position change, or CSS transform — so every pointer coordinate goes stale on scroll, and AD-17 already assumes otherwise |
| F4 | Medium | AD-19 makes `pointer: coarse` decisive and `hovering` unreachable, but the `pointer`/`hover` features report only the primary device and are documented-inaccurate on iOS, Android, ChromeOS and Windows; `event.pointerType` is the real discriminator |
| F5 | Medium | A 400 ms touch hold is specified with no `touch-action`, no `pointercancel`, and no `setPointerCapture`; panning cannot be `preventDefault`ed, so a drifting hold loses `pointerup` and the FSM can reach a spurious Commit or hang in `pressing` |
| F6 | Medium | Node floor `20.19+` transcribes Vite's `engines` correctly but Node 20 went EOL 2026-04-30, ~3 months before this document; the supported target is 22.12+ / 24 LTS |
| F7 | Medium | The Stack table pins no ESLint, typescript-eslint, or `@types/node` version, yet the paragraph beneath it makes a load-bearing (and incorrect) claim about ESLint; the `gen-tokens.ts` runner is also unnamed |
| F8 | Low-Medium | Canvas `devicePixelRatio` backing store is never addressed; DPR changes on zoom and monitor moves and a `content-box` observer won't fire — and the obvious fix (`device-pixel-content-box`) is still unsupported in Safari and not Baseline |
| F9 | Low | AD-7's pure-`event.target` hit-testing leans on two unstated SVG facts: `visiblePainted` requires a non-`none` fill/stroke (the rim band is the exposure), and the outermost `<svg>`'s hit behavior is implementation-specific, so misses must map to `neutral` |
| F10 | Low | `prefers-reduced-motion` is sampled once at mount; the query is live and OS-toggleable, so this is an unstated limitation rather than a neutral fact |
| F11 | Low | `blur` (window) and `visibilitychange` (document) target different objects — correct pairing, mechanical note only |
| F12 | Low | TS 7.0's changed defaults are unstated (`strict` on, `module: esnext`, `moduleResolution: node`/`baseUrl` now hard errors), so `moduleResolution: bundler` is now required |
| F13 | Low | "until 7.1" is firmer than Microsoft's hedged "we *expect*"; 7.1 is unreleased (`next` = `7.1.0-dev.20260725.1`) and its API is explicitly *new and different*, not the old surface restored |

## Verdict

**The half of the document most likely to be fabricated was not.** Every version pin — TypeScript 7.0.2, Vite 8.1.5, Vitest 4.1.10 — is the current npm `latest`; the Node floor is a character-exact transcription of Vite 8.1.5's `engines`; Vitest 4's peer range genuinely admits Vite 8; and the `@typescript/typescript6` bridge package is real, correctly named, and correctly described, down to the `tsc6` binary. The "Verified against the live registries on 2026-07-25" header is earned. The npm-facing research is exemplary and I could not fault it.

**The failures are in the inferences drawn from those facts, and in the Web platform.** F1 and F2 share one shape: a correct external fact was retrieved, then a convenient conclusion was drawn from it without checking the conclusion. TypeScript 7 does lack the compiler API — but "so we don't need the bridge" required reading typescript-eslint's peer range, which forbids TS 7 outright. `AudioContext` does need resuming — but "so the port resumes it on the first intent" required checking which events grant user activation, and hover does not.

The Web-platform layer is the weaker half and was largely not researched at all: `touch-action`, `pointercancel`, `setPointerCapture`, `devicePixelRatio`, and `matchMedia` appear **nowhere** in a document whose entire premise is that it has no framework to handle these for it. Reassuringly, **no API the spine names is deprecated or non-standard** — the gap is behavioral, not a stale API choice.

**Gate recommendation: do not hand off until F1 and F2 are resolved**, since both are day-one blockers with committed rules pointing the wrong way (F1 fails `npm install`; F2 silently kills a channel AD-9 declares mandatory). F3–F5 should be settled before the pointer adapter is written, as each amends a stated AD rather than adding code. F6–F13 are corrections to the document.
