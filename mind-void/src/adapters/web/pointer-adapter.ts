import type { Intent } from '../../core/intents';
import type { PreviewMode } from '../../core/snapshot';
import type { Surface } from '../../core/ports';

export type PointerDispatch = (intent: Intent) => void;

export type PointerAdapterOptions = {
  surface: Surface;
  dispatch: PointerDispatch;
};

/**
 * Zone resolution is DOM hit-test only (AD-7) — no point-in-polygon.
 * Body → solo, rim → mute. Touch emits no PREVIEW_SET (AD-19).
 */
export class PointerAdapter {
  private readonly surface: Surface;
  private readonly dispatch: PointerDispatch;
  private readonly onMove: (event: PointerEvent) => void;
  private readonly onLeave: (event: PointerEvent) => void;
  private attached = false;
  private lastPreviewKey = '';

  constructor(options: PointerAdapterOptions) {
    this.surface = options.surface;
    this.dispatch = options.dispatch;

    this.onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      const hit = resolveZone(event.target);
      if (!hit) {
        this.emitPreview(null, 'neutral');
        return;
      }
      this.emitPreview(hit.shardId, hit.mode);
    };

    this.onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      // Leaving the shard layer entirely → clear preview.
      const related = event.relatedTarget;
      if (
        related instanceof Node &&
        this.surface.layers.shards.contains(related)
      ) {
        return;
      }
      this.emitPreview(null, 'neutral');
    };
  }

  attach(): void {
    if (this.attached) return;
    const layer = this.surface.layers.shards;
    layer.addEventListener('pointermove', this.onMove);
    layer.addEventListener('pointerleave', this.onLeave);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached) return;
    const layer = this.surface.layers.shards;
    layer.removeEventListener('pointermove', this.onMove);
    layer.removeEventListener('pointerleave', this.onLeave);
    this.attached = false;
    this.lastPreviewKey = '';
  }

  private emitPreview(shardId: string | null, mode: PreviewMode): void {
    const key = `${mode}:${shardId ?? ''}`;
    if (key === this.lastPreviewKey) return;
    this.lastPreviewKey = key;
    this.dispatch({
      type: 'PREVIEW_SET',
      shardId,
      mode,
    });
  }
}

function resolveZone(
  target: EventTarget | null,
): { shardId: string; mode: 'solo' | 'mute' } | null {
  if (!(target instanceof Element)) return null;
  const el = target.closest('[data-zone][data-shard-id]');
  if (!el) return null;
  const shardId = el.getAttribute('data-shard-id');
  const zone = el.getAttribute('data-zone');
  if (!shardId) return null;
  if (zone === 'rim') return { shardId, mode: 'mute' };
  if (zone === 'body') return { shardId, mode: 'solo' };
  return null;
}
