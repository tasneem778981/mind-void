---
baseline_commit: af76dd2
---

# Story 3.1: Hold-to-commit and DeferReveal to Solid Charge

Status: done

## Tasks / Subtasks

- [x] FSM: HOLD_START → pressing → Clock holdCommit → committing → solid
- [x] Cancel paths: HOLD_END / CANCEL / PREVIEW other; ignore preview on pressed shard
- [x] DomView: hold-progress, magnetize, seam-flash, Solid Charge, thesis lifecycle
- [x] Core Vitest coverage + FakeClock nested flush
- [x] Verify + push

## Dev Agent Record

### Completion Notes List

- No COMMIT intent — resolution is Clock-only (AD-4/AD-5)
- Pointer/keyboard HOLD wiring included so the commit path is reachable (AD-23/AD-15)

### File List

- mind-void/src/core/decision-node-fsm.ts
- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/adapters/web/pointer-adapter.ts
- mind-void/src/adapters/web/keyboard-adapter.ts
- mind-void/src/app/mount.ts
- mind-void/src/styles/void.css
- mind-void/test/decision-node-fsm.test.ts
- mind-void/test/fake-clock.ts

## Change Log

- 2026-07-25: Story 3.1 hold-to-commit / DeferReveal done.
