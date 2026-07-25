import type { Intent } from '../../core/intents';
import type {
  DecisionNodeSnapshot,
  DecisionPhase,
  PreviewMode,
} from '../../core/snapshot';
import type { Surface } from '../../core/ports';

export type PointerDispatch = (intent: Intent) => void;

export type PointerAdapterOptions = {
  surface: Surface;
  dispatch: PointerDispatch;
  /** Cursor element created by DomView — position only (AD-10). */
  getCursor: () => HTMLElement | null;
};

const LOCKED: ReadonlySet<DecisionPhase> = new Set([
  'eliminating',
  'redistributing',
  'committing',
]);

/**
 * Zone resolution is DOM hit-test only (AD-7).
 * Cursor position written here; cursor mode written by DomView (AD-10).
 * Touch skips PREVIEW_SET (AD-19). Re-sync after geometry/lock settle (AD-17).
 */
export class PointerAdapter {
  private readonly surface: Surface;
  private readonly dispatch: PointerDispatch;
  private readonly getCursor: () => HTMLElement | null;
  private readonly onMove: (event: PointerEvent) => void;
  private readonly onLeave: (event: PointerEvent) => void;
  private attached = false;
  private lastPreviewKey = '';
  private host: HTMLElement | null = null;
  private lastClientX = 0;
  private lastClientY = 0;
  private hasClient = false;
  private lastPointerType: string | null = null;
  private lastPhase: DecisionPhase = 'idle';
  private resyncQueued = false;

  constructor(options: PointerAdapterOptions) {
    this.surface = options.surface;
    this.dispatch = options.dispatch;
    this.getCursor = options.getCursor;

    this.onMove = (event: PointerEvent) => {
      this.lastPointerType = event.pointerType;
      this.lastClientX = event.clientX;
      this.lastClientY = event.clientY;
      this.hasClient = true;

      if (event.pointerType === 'touch') {
        this.hideCursor();
        return;
      }

      this.showAndPlaceCursor(event.clientX, event.clientY);

      const hit = resolveZone(event.target);
      if (!hit) {
        this.emitPreview(null, 'neutral');
        return;
      }
      this.emitPreview(hit.shardId, hit.mode);
    };

    this.onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const related = event.relatedTarget;
      if (related instanceof Node && this.host?.contains(related)) {
        return;
      }
      this.emitPreview(null, 'neutral');
      this.hideCursor();
    };
  }

  attach(): void {
    if (this.attached) return;
    this.host = this.surface.layers.vignette.parentElement;
    if (!this.host) return;
    this.host.addEventListener('pointermove', this.onMove);
    this.host.addEventListener('pointerleave', this.onLeave);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached || !this.host) return;
    this.host.removeEventListener('pointermove', this.onMove);
    this.host.removeEventListener('pointerleave', this.onLeave);
    this.attached = false;
    this.lastPreviewKey = '';
    this.host = null;
    this.hasClient = false;
    this.resyncQueued = false;
  }

  /**
   * Observe snapshot edges (lock exit). Must not gate dispatch on phase (AD-3).
   * Call from composition root subscription — never dispatch sync from paint.
   */
  observeSnapshot(snapshot: DecisionNodeSnapshot): void {
    const wasLocked = LOCKED.has(this.lastPhase);
    const nowLocked = LOCKED.has(snapshot.phase);
    this.lastPhase = snapshot.phase;
    if (wasLocked && !nowLocked) {
      this.scheduleResync();
    }
  }

  /** After host resize / geometry relayout (AD-17). */
  onGeometryChanged(): void {
    this.scheduleResync();
  }

  private scheduleResync(): void {
    if (this.resyncQueued) return;
    this.resyncQueued = true;
    queueMicrotask(() => {
      this.resyncQueued = false;
      this.resyncPreview();
    });
  }

  private resyncPreview(): void {
    if (!this.hasClient || !this.attached) return;
    if (this.lastPointerType === 'touch') {
      this.hideCursor();
      return;
    }

    this.showAndPlaceCursor(this.lastClientX, this.lastClientY);

    const el = document.elementFromPoint(this.lastClientX, this.lastClientY);
    if (!el || (this.host && !this.host.contains(el))) {
      this.emitPreview(null, 'neutral');
      return;
    }
    const hit = resolveZone(el);
    if (!hit) {
      this.emitPreview(null, 'neutral');
      return;
    }
    this.emitPreview(hit.shardId, hit.mode);
  }

  private showAndPlaceCursor(clientX: number, clientY: number): void {
    const cursor = this.getCursor();
    if (!cursor) return;
    if (cursor.dataset.cursor === 'hidden') {
      cursor.dataset.cursor = 'idle';
    }
    const local = this.surface.clientToLocal(clientX, clientY);
    cursor.style.transform = `translate(${local.x}px, ${local.y}px) translate(-50%, -50%)`;
  }

  private hideCursor(): void {
    const cursor = this.getCursor();
    if (cursor) cursor.dataset.cursor = 'hidden';
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
