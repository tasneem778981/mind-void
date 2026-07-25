---
baseline_commit: NO_VCS
---

# Story 1.3: VoidCanvas surface and closed layer stack

Status: done

<!-- Ultimate context engine analysis completed -->

## Story

As a reviewer,
I want a full-bleed spatial VoidCanvas sized to the mount root,
so that the demo reads as depth-first atmosphere rather than a dashboard or list.

## Acceptance Criteria

1. **Given** `mountMindVoid` has been called on a root  
   **When** the surface initializes  
   **Then** `VoidCanvas` implements the core `Surface` port (layers, size, DPR, `clientToLocal`) and is injected — adapters never import each other (AD-21)  
   **And** the closed layer stack bottom-to-top is: vignette background → SVG shard layer → FX canvas (`pointer-events: none`) → text layer (UX-DR3, FR1, FR9)  
   **And** layers size to the mount root, not the viewport (NFR3)  
   **And** Emerald vignette uses generated void tokens (void-abyss / void-base / void-haze) (FR2, UX-DR1)  
   **And** no header, toolbar, cards, tooltips, coach marks, overlays, or confirmation dialogs (UX-DR17)  
   **And** no checkbox-list layout as the default metaphor (FR1)

2. **Given** the mount root resizes, scrolls, or a gesture starts  
   **When** client-to-local conversion is needed  
   **Then** only `VoidCanvas` calls `getBoundingClientRect` on its own root  
   **And** the cached rect invalidates via `ResizeObserver`, window `scroll`/`resize`, and unconditionally at gesture start (AD-6)

## Tasks / Subtasks

- [x] Define `Surface` port in `src/core/ports.ts` (AC: #1, AD-21)
- [x] Implement `VoidCanvas` in `src/adapters/web/void-canvas.ts` (AC: #1, #2)
- [x] Wire in `mountMindVoid` (AC: #1)
- [x] Styles in `void.css` for layer stack / vignette (AC: #1)
- [x] Verify: `tsc`, `vitest`, `vite build`

### Review Findings

- [x] [Review][Defer] DOM element types on `Surface` / `SurfaceLayers` live in core ports as type-only handles (AD-21 requires layer handles on the port; no runtime DOM APIs in core)

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent router)

### Completion Notes List

- `Surface` port: layers, width/height, dpr, `clientToLocal`, `invalidateClientRect`, `dispose`
- `VoidCanvas` builds closed stack: vignette → SVG shards → FX canvas (`pointer-events: none`) → text
- Vignette uses `--mv-void-haze/base/abyss` radial gradient from DESIGN.md
- Rect cache invalidated by ResizeObserver, window scroll (capture)+resize, and `invalidateClientRect()`
- Only VoidCanvas calls `getBoundingClientRect`; mount constructs Surface and disposes on unmount
- Gates: tsc / 8 tests / vite build pass

### File List

- mind-void/src/core/ports.ts
- mind-void/src/adapters/web/void-canvas.ts
- mind-void/src/app/mount.ts
- mind-void/src/styles/void.css
- _bmad-output/implementation-artifacts/1-3-voidcanvas-surface-and-closed-layer-stack.md

## Change Log

- 2026-07-25: Story 1.3 implemented — VoidCanvas Surface + closed layer stack; marked done.
