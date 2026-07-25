---
baseline_commit: 26f3f3e
---

# Story 3.2: Eliminate, redistribute, and AD-12 floor

Status: done

## Tasks / Subtasks

- [x] FSM eliminating → redistributing → idle|hovering; AD-12 refuse at 2 shards
- [x] Focus survival AD-13; refuse eliminate while pressing
- [x] DomView cut-flash dissolve + geometry remapped by surviving ids
- [x] Mount recomputes ShardGeometry on shardIds change
- [x] Vitest coverage; verify + push

## Dev Agent Record

### Completion Notes List

- `eliminatingShardId` on snapshot for lossless cut-flash
- Geometry accepts explicit shard id list so survivors keep identity

### File List

- mind-void/src/core/decision-node-fsm.ts
- mind-void/src/core/snapshot.ts
- mind-void/src/core/shard-geometry.ts
- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/app/mount.ts
- mind-void/src/styles/void.css
- mind-void/test/decision-node-fsm.test.ts

## Change Log

- 2026-07-25: Story 3.2 Eliminate + AD-12 floor done.
