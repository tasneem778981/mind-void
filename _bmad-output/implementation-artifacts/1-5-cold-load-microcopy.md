---
baseline_commit: NO_VCS
---

# Story 1.5: Cold-load microcopy

Status: done

## Story

As a portfolio reviewer,
I want a quiet hint and an architecture credit visible at cold load,
so that I orient without a control guide and see the systems narrative in-frame.

## Tasks / Subtasks

- [x] DomView renders hint + credit into text layer from `productCopy`
- [x] CSS layout: hint bottom-center, credit bottom-right, meta type tokens
- [x] Thesis element present but hidden until solid (stub)
- [x] Verify + push

## Dev Agent Record

### Completion Notes List

- Hint / thesis / credit from `copy.generated.ts` only (AD-20)
- Hint cold-load visible; thesis hidden until `phase === 'solid'` (Epic 3 will drive)
- Credit always visible bottom-right
- Epic 1 complete

### File List

- mind-void/src/adapters/web/dom-view.ts
- mind-void/src/styles/void.css
- _bmad-output/implementation-artifacts/1-5-cold-load-microcopy.md

## Change Log

- 2026-07-25: Story 1.5 cold-load microcopy; Epic 1 done.
