import type { Intent } from '../../core/intents';
import type { Surface } from '../../core/ports';

export type KeyboardDispatch = (intent: Intent) => void;

export type KeyboardAdapterOptions = {
  surface: Surface;
  dispatch: KeyboardDispatch;
  /** Current focused shard from FSM snapshot (adapter must not gate on phase). */
  getFocusedShardId: () => string | null;
};

/**
 * Keyboard floor (AD-8, AD-15, AD-25).
 * Tab → native + focusin → FOCUS_SET.
 * Enter/Space hold → HOLD_*; Delete/Backspace → ELIMINATE.
 */
export class KeyboardAdapter {
  private readonly surface: Surface;
  private readonly dispatch: KeyboardDispatch;
  private readonly getFocusedShardId: () => string | null;
  private readonly onFocusIn: (event: FocusEvent) => void;
  private readonly onKeyDown: (event: KeyboardEvent) => void;
  private readonly onKeyUp: (event: KeyboardEvent) => void;
  private readonly onBlur: () => void;
  private readonly onVisibility: () => void;
  private attached = false;
  private host: HTMLElement | null = null;
  private holdKey: string | null = null;

  constructor(options: KeyboardAdapterOptions) {
    this.surface = options.surface;
    this.dispatch = options.dispatch;
    this.getFocusedShardId = options.getFocusedShardId;

    this.onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const body = target.closest('[data-zone="body"][data-shard-id]');
      if (!body || !this.host?.contains(body)) return;
      const shardId = body.getAttribute('data-shard-id');
      if (!shardId) return;
      queueMicrotask(() => {
        this.dispatch({ type: 'FOCUS_SET', shardId });
      });
    };

    this.onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.shiftKey && event.key !== 'Tab') return;
      if (event.repeat) return;

      const key = event.key;
      if (key === 'Enter' || key === ' ') {
        if (key === ' ') event.preventDefault();
        const shardId = this.getFocusedShardId();
        if (!shardId) return;
        this.holdKey = key;
        this.dispatch({ type: 'HOLD_START', shardId });
        return;
      }

      if (key === 'Delete' || key === 'Backspace') {
        event.preventDefault();
        const shardId = this.getFocusedShardId();
        if (!shardId) return;
        this.dispatch({ type: 'ELIMINATE', shardId });
      }
    };

    this.onKeyUp = (event: KeyboardEvent) => {
      if (event.key !== this.holdKey) return;
      this.holdKey = null;
      this.dispatch({ type: 'HOLD_END' });
    };

    this.onBlur = () => {
      this.holdKey = null;
      this.dispatch({ type: 'CANCEL' });
    };

    this.onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        this.holdKey = null;
        this.dispatch({ type: 'CANCEL' });
      }
    };
  }

  attach(): void {
    if (this.attached) return;
    this.host = this.surface.layers.vignette.parentElement;
    if (!this.host) return;
    this.host.addEventListener('focusin', this.onFocusIn);
    this.host.addEventListener('keydown', this.onKeyDown);
    this.host.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.attached = true;
  }

  detach(): void {
    if (!this.attached || !this.host) return;
    this.host.removeEventListener('focusin', this.onFocusIn);
    this.host.removeEventListener('keydown', this.onKeyDown);
    this.host.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.attached = false;
    this.host = null;
    this.holdKey = null;
  }
}
