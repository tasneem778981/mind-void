---
baseline_commit: NO_VCS
---

# Story 2.1: FSM core — idle/hovering and device-neutral intents

Status: done

## Story

As a builder,
I want a pure DecisionNodeFSM that owns idle/hovering preview state via device-neutral intents,
so that both pointer and keyboard paths share one source of truth without Web APIs in the core.

## Tasks / Subtasks

- [x] intents.ts — FOCUS_SET / PREVIEW_SET / HOLD_START / HOLD_END / ELIMINATE / CANCEL (no COMMIT)
- [x] Clock port + FakeClock + TimeoutClock
- [x] DecisionNodeFSM idle↔hovering, focus/preview independence, AD-12 mute coerce
- [x] Vitest coverage
- [x] Wire FSM in mountMindVoid
- [x] Push

## Dev Agent Record

### Completion Notes List

- Pure core FSM; adapters dispatch later unconditionally
- Hold/eliminate intents accepted as no-ops until Epic 3 / 2.x resolve
- 17 Vitest tests passing

### File List

- mind-void/src/core/intents.ts
- mind-void/src/core/ports.ts
- mind-void/src/core/decision-node-fsm.ts
- mind-void/src/adapters/web/raf-clock.ts
- mind-void/src/app/mount.ts
- mind-void/test/fake-clock.ts
- mind-void/test/decision-node-fsm.test.ts

## Change Log

- 2026-07-25: Story 2.1 FSM idle/hovering core done.
