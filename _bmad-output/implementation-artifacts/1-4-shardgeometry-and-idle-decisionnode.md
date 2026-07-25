---
baseline_commit: NO_VCS
---

# Story 1.4: ShardGeometry and idle DecisionNode

Status: done

## Story

As a reviewer,
I want to see one centered cracked DecisionNode with soft-pulsing shards at cold load,
so that unfinished intention reads as suspended energy, not a static flat shape.

## Acceptance Criteria

1. Pure `ShardGeometry` for counts 2–5 — satisfied.
2. DomView idle DecisionNode + Vitest — satisfied.

## Tasks / Subtasks

- [x] Implement `src/core/shard-geometry.ts` + Vitest
- [x] Minimal `snapshot.ts` cold-load shape
- [x] Implement `DomView` idle render into Surface.shards SVG
- [x] Wire mount: default shardCount 3, derive nodeRadius, render + resize re-layout
- [x] CSS idle pulse (gated by profile idlePulse switch)
- [x] Verify gates + push

## Dev Agent Record

### Completion Notes List

- `computeShardGeometry`: binary (±3px seam normal) + radial 3–5 (bisector offset); rim bands; seams over fills
- `DomView` one-way render: body + rim (rim above), hard corners, idle pulse via CSS
- Mount derives `nodeRadius`, default `shardCount=3`, ResizeObserver re-layout
- Vitest: 12 passed

### File List

- mind-void/src/core/shard-geometry.ts
- mind-void/src/core/snapshot.ts
- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/app/mount.ts
- mind-void/src/styles/void.css
- mind-void/test/shard-geometry.test.ts

## Change Log

- 2026-07-25: Story 1.4 implemented — ShardGeometry + idle DomView; marked done.
