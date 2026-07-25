---
baseline_commit: 32cf6c5
---

# Story 2.4: Keyboard floor and focus ring

Status: done

## Tasks / Subtasks

- [x] Shard body focusable: tabindex=0, role=option, aria-label from generated copy
- [x] KeyboardAdapter dispatches FOCUS_SET (focusin, microtask)
- [x] DomView focus ring from focusedShardId (focus-ring token, never charge-glow)
- [x] Focus ≠ Solo; pointer mousedown does not steal focus
- [x] Rim/FX/ambient non-focusable; modifiers ignored
- [x] Verify + push

## Dev Agent Record

### Completion Notes List

- SVG shards layer no longer aria-hidden (AD-25)
- optionLabels + decisionNodeLabel in copy.generated.ts
- Hold/Eliminate keys deferred to Story 3.3

### File List

- mind-void/scripts/gen-tokens.ts
- mind-void/src/core/copy.generated.ts
- mind-void/src/adapters/web/keyboard-adapter.ts
- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/adapters/web/void-canvas.ts
- mind-void/src/app/mount.ts
- mind-void/src/styles/void.css

## Change Log

- 2026-07-25: Story 2.4 keyboard floor and focus ring done.
