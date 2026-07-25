---
baseline_commit: af76dd2
---

# Story 3.3: Pointer and keyboard resolve mappings

Status: done

## Tasks / Subtasks

- [x] Pointer: body down → HOLD_START + capture; rim down → ELIMINATE; up → HOLD_END; cancel → CANCEL
- [x] Keyboard: Enter/Space hold; Delete/Backspace eliminate; blur/visibility CANCEL; ignore repeat/modifiers
- [x] No click listener; touch-action none already on shard layer
- [x] Verify + push

## Dev Agent Record

### Completion Notes List

- ELIMINATE is dispatched by adapters; FSM handling lands in Story 3.2
- Hold progress shared via pressedShardId (AD-8)

### File List

- mind-void/src/adapters/web/pointer-adapter.ts
- mind-void/src/adapters/web/keyboard-adapter.ts
- mind-void/src/app/mount.ts

## Change Log

- 2026-07-25: Story 3.3 resolve mappings done.
