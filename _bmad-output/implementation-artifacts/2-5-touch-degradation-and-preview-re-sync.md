---
baseline_commit: 9e2f930
---

# Story 2.5: Touch degradation and preview re-sync

Status: done

## Tasks / Subtasks

- [x] Touch (pointerType===touch): no PREVIEW_SET; cursor hidden
- [x] PointerAdapter caches last client position
- [x] Re-hit-test via elementFromPoint after geometry change / lock exit
- [x] Dispatch deferred to microtask (AD-17, AD-24)
- [x] Verify + push

## Dev Agent Record

### Completion Notes List

- observeSnapshot detects lock→open edge; onGeometryChanged from mount layout
- No coarse-media-query path

### File List

- mind-void/src/adapters/web/pointer-adapter.ts
- mind-void/src/app/mount.ts

## Change Log

- 2026-07-25: Story 2.5 touch degradation and preview re-sync done.
