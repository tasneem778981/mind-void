---
baseline_commit: db3ea07
---

# Story 2.3: Custom attract and repulse cursor

Status: done

## Tasks / Subtasks

- [x] DomView owns cursor mode from snapshot (attract/repulse/idle)
- [x] PointerAdapter owns cursor position transform only (AD-10)
- [x] Attract 18px charge-glow + centre dot + inward ticks; repulse 12px + outward ticks
- [x] `cursor: none` on mount root; never write body/:root; hide on touch
- [x] Verify + push

## Dev Agent Record

### Completion Notes List

- Mode via `data-cursor` on `.mv-cursor` inside mount root
- Position via `transform` from PointerAdapter using `clientToLocal`
- Touch sets `data-cursor=hidden` and still skips PREVIEW_SET

### File List

- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/adapters/web/pointer-adapter.ts
- mind-void/src/app/mount.ts
- mind-void/src/styles/void.css

## Change Log

- 2026-07-25: Story 2.3 attract/repulse cursor done.
