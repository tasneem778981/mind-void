---
name: Mind Void
description: Dark emerald void for a closure-first decision demo. Suspended intention glows; resolution goes quiet.
status: final
updated: 2026-07-25
sources:
  - _bmad-output/planning-artifacts/prds/prd-mind-void-2026-07-25/prd.md
colors:
  void-abyss: '#020A08'
  void-base: '#05130F'
  void-haze: '#0A2019'
  shard-face: '#0E2A22'
  shard-face-solo: '#154538'
  shard-face-mute: '#081713'
  shard-edge: '#1C4E40'
  seam: '#0A1C17'
  charge-core: '#14B181'
  charge-glow: '#3FE0A8'
  charge-pulse: '#26C48F'
  solid-face: '#176249'
  solid-halo: '#5CF0BC'
  repulse-edge: '#4E7C74'
  cut-flash: '#A7F3E4'
  ambient-spark: '#1B7A5C'
  focus-ring: '#D7EFE6'
  ink-primary: '#D7EFE6'
  ink-secondary: '#7DA79A'
  ink-faint: '#3E5C53'
typography:
  display:
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: '28px'
    fontWeight: '300'
    lineHeight: '1.2'
    letterSpacing: '0.06em'
  body:
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif"
    fontSize: '15px'
    fontWeight: '400'
    lineHeight: '1.6'
  meta:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Mono', monospace"
    fontSize: '12px'
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0.08em'
rounded:
  none: '0px'
  sm: '4px'
  md: '10px'
  full: '9999px'
spacing:
  '1': '4px'
  '2': '8px'
  '3': '12px'
  '4': '16px'
  '5': '24px'
  '6': '32px'
  '7': '48px'
  rim-band: '14px'
motion:
  pulse-idle: '3200ms'
  preview-in: '120ms'
  preview-out: '180ms'
  hold-commit: '400ms'
  eliminate-dissolve: '220ms'
  redistribute: '300ms'
  fuse-magnetize: '260ms'
  seam-flash: '120ms'
  solid-settle: '320ms'
  ease-calm: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  ease-magnetize: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
components:
  void-canvas:
    background: '{colors.void-base}'
    vignette: 'radial-gradient(ellipse at 50% 45%, {colors.void-haze} 0%, {colors.void-base} 55%, {colors.void-abyss} 100%)'
  shard:
    fill: '{colors.shard-face}'
    stroke: '{colors.shard-edge}'
    strokeWidth: '1px'
    corner: '{rounded.none}'
    pulseColor: '{colors.charge-pulse}'
    pulseEasing: '{motion.ease-calm}'
    idleHalo: '0 0 14px {colors.charge-core}'
  seam-line:
    stroke: '{colors.seam}'
    strokeWidth: '2px'
    cap: 'square'
    flashColor: '{colors.charge-glow}'
  cursor-attract:
    ring: '{colors.charge-glow}'
    ringSize: '18px'
    dot: '4px'
    ticks: 'inward'
  cursor-repulse:
    ring: '{colors.repulse-edge}'
    ringSize: '12px'
    dot: 'none'
    ticks: 'outward'
  ambient-field:
    sparkColor: '{colors.ambient-spark}'
    sparkSize: '1.5px'
    density: 'sparse'
  focus-ring:
    stroke: '{colors.focus-ring}'
    strokeWidth: '2px'
    offset: '{spacing.1}'
  shard-solo:
    fill: '{colors.shard-face-solo}'
    glow: '0 0 24px {colors.charge-glow}'
  shard-mute:
    fill: '{colors.shard-face-mute}'
    stroke: '{colors.repulse-edge}'
    glow: 'none'
  rim-zone:
    band: '{spacing.rim-band}'
    stroke: '{colors.shard-edge}'
    strokeHover: '{colors.repulse-edge}'
  hold-progress:
    track: '{colors.shard-edge}'
    fill: '{colors.charge-glow}'
    duration: '{motion.hold-commit}'
  solid-charge:
    fill: '{colors.solid-face}'
    glow: '0 0 40px {colors.solid-halo}'
    corner: '{rounded.none}'
    settleEasing: '{motion.ease-magnetize}'
  hint-line:
    color: '{colors.ink-faint}'
    typography: '{typography.meta}'
---

# Mind Void — Design Spine

## Brand & Style

Mind Void is a dark emerald void, not a productivity dashboard. The screen reads as depth first: an unlit field where a few charged shapes hold light because something is unresolved. Nothing is chrome. There is no header bar, no toolbar, no card stack — the canvas *is* the product.

The aesthetic posture is **calm tension**. Unresolved geometry glows and pulses slowly; resolved geometry settles and stops asking for attention. The visual reward for deciding is not a celebration — it is quiet. Emerald carries this because deep green reads as depth and rest, while its luminous end reads as stored energy.

`[ASSUMPTION]` Deep-void luminance chosen over bright jade per PRD direction lock. Confirm before token freeze.

## Colors

The palette is one hue family plus one cold outlier. Nothing else is allowed on the canvas.

- **Void Abyss (`#020A08`)** and **Void Base (`#05130F`)** are the field. Abyss sits at the edges, Base at center-out, with **Void Haze (`#0A2019`)** as the faint atmospheric lift behind active nodes. Together they make a vignette that pushes the eye to the middle without drawing a frame.
- **Shard Face (`#0E2A22`)** is unresolved geometry at rest — visible but dim, deliberately under-lit so the pulse is the only life in it.
- **Charge Core (`#14B181`)** and **Charge Glow (`#3FE0A8`)** are stored mental energy. They appear in the idle pulse, the Solo preview lift, and the hold-to-commit progress. This is the only chromatic brightness in the product.
- **Solid Face (`#176249`)** + **Solid Halo (`#5CF0BC`)** mark resolution. Brighter than a shard, but *stable* — no pulse. The difference the user feels is not "brighter," it is "still."
- **Repulse Edge (`#4E7C74`)** is the cold outlier: a desaturated slate-teal used only on the Mute rim. It removes green saturation rather than adding a warning color — elimination reads as *draining*, never as an error.
- **Cut Flash (`#A7F3E4`)** is the pale one-frame flash on Eliminate. Cold and brief; never used as a fill.
- **Ambient Spark (`#1B7A5C`)** is the field's faint background life — sparse, slow, barely-there points drifting in the void so the canvas never reads as a static wallpaper. Dim enough that it never competes with a node.
- **Focus Ring (`#D7EFE6`)** is deliberately achromatic-leaning, not `charge-glow`. Keyboard focus must not borrow the Commit semantic — a focused shard is not a previewed shard.
- **Ink Primary / Secondary / Faint** carry the small amount of text: caption, hint line, and architecture credit.

Avoid: red or amber of any kind (this is not a form), multi-hue category coding, and saturated neon green — Emerald here is depth, not gaming RGB. Also avoid the portfolio defaults this project is defined against: purple-gradient SaaS, cream-and-serif editorial, and glassmorphic card stacks.

**Palette extensibility.** The one-hue rule governs v1, where Decision is the only ChargeNode kind on screen. When Noise and Promise skins arrive, they differentiate by *geometry and pulse behaviour first*; if a hue split becomes unavoidable, it extends within the emerald–teal range rather than introducing a competing chromatic family.

## Typography

Text is nearly absent by design; the interaction teaches itself. Three roles only.

- **display** — the product name and the one-line thesis, in a light weight with open tracking so it reads as a title card rather than an app header.
- **body** — reserved for the case-study caption when the demo is embedded in the portfolio page.
- **meta** — monospace, used for the hint line and the architecture credit (`InputAdapter → FSM → DomView + EffectBus → ParticleEngine`). Monospace signals "systems note," which is the portfolio point.

No all-caps labels, no display serif, no second typeface beyond the mono/sans pair.

## Layout & Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48. `rim-band` (14px) is a separate named token because it is a *hit zone*, not a visual gap — it defines where Mute begins on the shard perimeter.

The VoidCanvas fills the viewport (or the embed frame) with no margin. Nodes are positioned in canvas-local space, never in a grid. The only laid-out elements are the hint line (bottom-center, `{spacing.7}` from edge) and the architecture credit (bottom-right, `{spacing.5}` from edge).

## Elevation & Depth

There are no shadows and no cards. Depth is built from three things: the canvas vignette, glow radius, and pulse. A node feels "in front" because it emits light, not because it casts a shadow. Elevation is emission.

The FX canvas overlays the DOM/SVG layer at full size and never draws a surface — only particles and flashes on transparent background.

## Shapes

Shards are polygons with hard corners (`{rounded.none}`). Rounding a shard would break the cracked-glass read that models analysis paralysis. The Solid Charge keeps hard corners too — it is fused, not softened. The seam between shards is drawn in **Seam (`#0A1C17`)** at 1px: darker than both faces, so cracks read as absence of material.

`{rounded.sm}` and `{rounded.md}` exist only for the rare chrome element (hint line container, embed frame).

## Components

- **Void Canvas** — full-bleed vignette per `{components.void-canvas.vignette}`. Hosts DOM/SVG nodes; FX canvas overlays with `pointer-events: none`.
- **Ambient Field** — sparse `{colors.ambient-spark}` points drifting slowly across the canvas at low opacity. Purely atmospheric; never interactive, never near enough to a node to be mistaken for one.
- **Shard** — polygon at `{colors.shard-face}` with 1px `{colors.shard-edge}`. Idle: opacity pulse toward `{colors.charge-pulse}` on `{motion.pulse-idle}` with `{motion.ease-calm}`, never a scale pulse (scale would fight hit-testing).
- **Shard geometry** — A **binary** DecisionNode is one shape split by a single seam through the center, halves offset ~3px along the seam normal. A **multi-shard** node (3–5) radiates seams from the center, each shard offset ~3px outward along its own bisector. Above 5 shards the cracked read collapses into a pie chart, so 5 is the practical ceiling. `[ASSUMPTION]` Ceiling of 5 is a UX judgment; PRD says only "2–N".
- **Seam Line** — 2px `{colors.seam}`, square caps, drawn *over* shard fills so cracks read as missing material. At Commit the seam brightens to `{colors.charge-glow}` for `{motion.seam-flash}` before disappearing.
- **Cursor — attract** — 18px ring in `{colors.charge-glow}` with a centre dot and four tick marks pointing *inward*. Appears with Solo.
- **Cursor — repulse** — 12px ring in `{colors.repulse-edge}`, no centre dot, four ticks pointing *outward*. Appears with Mute. The attract/repulse pair is a required channel (PRD FR-4/FR-5), not decoration — the ring size difference alone must be legible at a glance.
- **Focus Ring** — 2px `{colors.focus-ring}` offset `{spacing.1}` outside the shard outline. Keyboard only; never shown for pointer interaction.
- **Shard — Solo** — face lifts to `{colors.shard-face-solo}`, glow `0 0 24px {colors.charge-glow}`, in over `{motion.preview-in}`. Paired with the attract cursor; the two channels always fire together.
- **Shard — Mute** — face drains to `{colors.shard-face-mute}`, edge shifts to `{colors.repulse-edge}`, glow removed. Paired with the repulse cursor.
- **Rim Zone** — `{spacing.rim-band}` inset band along the shard perimeter. Not visible at rest; on hover it is what the Mute treatment reveals.
- **Hold Progress** — a stroke that fills along the shard perimeter over `{motion.hold-commit}`, from `{colors.shard-edge}` to `{colors.charge-glow}`. This is the only progress indicator in the product.
- **Solid Charge** — `{colors.solid-face}` with `{colors.solid-halo}` glow, no seam, no pulse. Settles with `{motion.ease-magnetize}` and a slight overshoot; every other transition uses `{motion.ease-calm}`.
- **Hint Line** — single monospace sentence in `{colors.ink-faint}`, bottom-center. Present at cold load; fades once the first Commit lands.

## Do's and Don'ts

| Do | Don't |
|---|---|
| One hue family (emerald) + one cold outlier for Mute | Red/amber error colors, category color coding |
| Depth from vignette, glow, and pulse | Drop shadows, cards, elevation layers |
| Hard polygon corners on shards and solid charge | Rounded shards, pills, circular nodes |
| Opacity pulse on idle nodes | Scale pulse (breaks hit-testing) |
| Stillness as the reward for resolution | Confetti, checkmarks, celebration bursts |
| Mute = drained saturation | Mute = red, X icon, or strikethrough |
| Monospace only for systems notes | Monospace as a decorative display face |
| Distinct cursor rings for attract vs repulse | A single cursor with only a colour change |
| Focus ring in `{colors.focus-ring}` | Focus ring in `{colors.charge-glow}` — that colour means Commit |
| Emerald depth as the whole identity | Purple-gradient SaaS, cream-serif editorial, glassmorphic cards |

→ Visual reference: `mockups/void.html` (Idle · Solo · Mute · Solid). The spines win on conflict with any mock.
