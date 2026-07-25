import type { Intent } from '../../core/intents';
import type { Surface } from '../../core/ports';

export type KeyboardDispatch = (intent: Intent) => void;

export type KeyboardAdapterOptions = {
  surface: Surface;
  dispatch: KeyboardDispatch;
};

/**
 * Keyboard floor (AD-8, AD-15, AD-25).
 * Story 2.4: FOCUS_SET from focusin; modifiers ignored (Shift+Tab uses native order).
 * Hold / Eliminate keys wire in Story 3.3.
 */
export class KeyboardAdapter {
  private readonly surface: Surface;
  private readonly dispatch: KeyboardDispatch;
  private readonly onFocusIn: (event: FocusEvent) => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private attached = false;
  private host: HTMLElement | null = null;

  constructor(options: KeyboardAdapterOptions) {
    this.surface = options.surface;
    this.dispatch = options.dispatch;

    this.onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const body = target.closest('[data-zone="body"][data-shard-id]');
      if (!body || !this.host?.contains(body)) return;
      const shardId = body.getAttribute('data-shard-id');
      if (!shardId) return;
      // AD-24: never dispatch synchronously from a snapshot-driven focus() path.
      queueMicrotask(() => {
        this.dispatch({ type: 'FOCUS_SET', shardId });
      });
    };

    this.onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      // Shift allowed only with Tab (native reverse). Other Shift+key ignored (AD-15).
      if (event.shiftKey && event.key !== 'Tab') return;
      // Enter / Space / Delete → Story 3.3
    };
  }

  attach(): void {
    if (this.attached) return;
    this.host = this.surface.layers.vignette.parentElement;
    if (!this.host) return;
    this.host.addEventListener('focusin', this.onFocusIn);
    this.host.addEventListener('keydown', this.onKeyDown);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached || !this.host) return;
    this.host.removeEventListener('focusin', this.onFocusIn);
    this.host.removeEventListener('keydown', this.onKeyDown);
    this.attached = false;
    this.host = null;
  }
}
