import type { Intent } from './intents';
import type { MotionProfile } from './motion.generated';
import type { Clock, ClockHandle } from './ports';
import type {
  DecisionNodeSnapshot,
  DecisionPhase,
  PreviewMode,
} from './snapshot';

export type SnapshotListener = (snapshot: DecisionNodeSnapshot) => void;

export type DecisionNodeFSMOptions = {
  shardIds: readonly string[];
  clock: Clock;
  motion: MotionProfile;
};

const LOCKED: ReadonlySet<DecisionPhase> = new Set([
  'eliminating',
  'redistributing',
  'committing',
]);

/**
 * Pure interaction owner (AD-1, AD-2, AD-3, AD-5).
 * Hold → Commit is Clock-driven; there is no COMMIT intent (AD-4).
 */
export class DecisionNodeFSM {
  private readonly clock: Clock;
  private readonly motion: MotionProfile;
  private shardIds: string[];
  private phase: DecisionPhase = 'idle';
  private focusedShardId: string | null = null;
  private previewShardId: string | null = null;
  private previewMode: PreviewMode = 'neutral';
  private pressedShardId: string | null = null;
  private eliminatingShardId: string | null = null;
  private holdHandle: ClockHandle | null = null;
  private commitHandles: ClockHandle[] = [];
  private eliminateHandles: ClockHandle[] = [];
  private readonly listeners = new Set<SnapshotListener>();

  constructor(options: DecisionNodeFSMOptions) {
    if (options.shardIds.length < 2 || options.shardIds.length > 5) {
      throw new Error(
        `DecisionNodeFSM shardIds length must be 2–5, got ${options.shardIds.length}`,
      );
    }
    this.shardIds = [...options.shardIds];
    this.clock = options.clock;
    this.motion = options.motion;
  }

  subscribe(listener: SnapshotListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispose(): void {
    this.clearHoldTimer();
    this.clearCommitTimers();
    this.clearEliminateTimers();
    this.clock.invalidate();
    this.listeners.clear();
  }

  get motionProfile(): MotionProfile {
    return this.motion;
  }

  snapshot(): DecisionNodeSnapshot {
    return {
      phase: this.phase,
      shardIds: this.shardIds,
      focusedShardId: this.focusedShardId,
      previewShardId: this.previewShardId,
      previewMode: this.previewMode,
      pressedShardId: this.pressedShardId,
      eliminatingShardId: this.eliminatingShardId,
    };
  }

  /** Adapters dispatch unconditionally — FSM is the sole drop authority (AD-3). */
  dispatch(intent: Intent): void {
    if (this.phase === 'solid') return;
    if (LOCKED.has(this.phase)) return;

    switch (intent.type) {
      case 'FOCUS_SET':
        this.onFocusSet(intent.shardId);
        break;
      case 'PREVIEW_SET':
        this.onPreviewSet(intent.shardId, intent.mode);
        break;
      case 'HOLD_START':
        this.onHoldStart(intent.shardId);
        break;
      case 'HOLD_END':
        this.onHoldEnd();
        break;
      case 'CANCEL':
        this.onCancel();
        break;
      case 'ELIMINATE':
        this.onEliminate(intent.shardId);
        break;
      default: {
        const _exhaustive: never = intent;
        void _exhaustive;
      }
    }
  }

  private onFocusSet(shardId: string | null): void {
    if (shardId !== null && !this.shardIds.includes(shardId)) return;
    if (this.focusedShardId === shardId) return;
    this.focusedShardId = shardId;
    this.emit();
  }

  private onPreviewSet(shardId: string | null, mode: PreviewMode): void {
    if (this.phase === 'pressing') {
      // AD-12 tightening: preview of pressed shard ignored (any zone).
      if (shardId !== null && shardId === this.pressedShardId) return;
      // Other shard / neutral cancels the hold (FR7).
      this.cancelHold(/* keepPreviewUpdate */ true);
      // Fall through to apply the preview change below.
    }

    let nextMode = mode;
    let nextId = shardId;

    if (this.shardIds.length === 2 && nextMode === 'mute') {
      nextMode = 'neutral';
      nextId = null;
    }

    if (nextMode === 'neutral' || nextId === null) {
      if (this.phase === 'idle' && this.previewMode === 'neutral') return;
      this.previewShardId = null;
      this.previewMode = 'neutral';
      if (this.phase === 'hovering' || this.phase === 'idle' || this.phase === 'pressing') {
        this.phase = 'idle';
      }
      this.emit();
      return;
    }

    if (!this.shardIds.includes(nextId)) return;

    if (
      this.phase === 'hovering' &&
      this.previewShardId === nextId &&
      this.previewMode === nextMode
    ) {
      return;
    }

    this.previewShardId = nextId;
    this.previewMode = nextMode;
    if (
      this.phase === 'idle' ||
      this.phase === 'hovering' ||
      this.phase === 'pressing'
    ) {
      this.phase = 'hovering';
    }
    this.emit();
  }

  private onHoldStart(shardId: string): void {
    if (this.phase !== 'idle' && this.phase !== 'hovering') return;
    if (!this.shardIds.includes(shardId)) return;

    this.pressedShardId = shardId;
    this.phase = 'pressing';
    this.clearHoldTimer();
    this.holdHandle = this.clock.after(this.motion.holdCommit, () => {
      this.holdHandle = null;
      this.beginCommit();
    });
    this.emit();
  }

  private onHoldEnd(): void {
    if (this.phase !== 'pressing') return;
    this.cancelHold(false);
  }

  private onCancel(): void {
    if (this.phase !== 'pressing') return;
    this.cancelHold(false);
  }

  private onEliminate(shardId: string): void {
    if (this.phase !== 'idle' && this.phase !== 'hovering') return;
    // AD-12: floor at two shards — Commit is the only exit.
    if (this.shardIds.length <= 2) return;
    if (!this.shardIds.includes(shardId)) return;

    this.clearHoldTimer();
    this.pressedShardId = null;
    this.eliminatingShardId = shardId;
    this.phase = 'eliminating';
    this.emit();

    const dissolve = this.motion.eliminateDissolve;
    const h1 = this.clock.after(dissolve, () => {
      this.finishEliminate(shardId);
    });
    this.eliminateHandles.push(h1);
  }

  private finishEliminate(removedId: string): void {
    const idx = this.shardIds.indexOf(removedId);
    if (idx < 0) return;

    this.shardIds = this.shardIds.filter((id) => id !== removedId);

    if (this.focusedShardId === removedId) {
      const nextIdx = Math.min(idx, this.shardIds.length - 1);
      this.focusedShardId = this.shardIds[nextIdx] ?? null;
    }
    if (this.previewShardId === removedId) {
      this.previewShardId = null;
      this.previewMode = 'neutral';
    }

    this.eliminatingShardId = null;
    this.phase = 'redistributing';
    this.emit();

    const redistribute = this.motion.redistribute;
    const finish = (): void => {
      this.phase =
        this.previewMode !== 'neutral' && this.previewShardId !== null
          ? 'hovering'
          : 'idle';
      this.emit();
    };

    if (redistribute <= 0) {
      finish();
      return;
    }
    const h2 = this.clock.after(redistribute, finish);
    this.eliminateHandles.push(h2);
  }

  private cancelHold(previewAlreadyUpdating: boolean): void {
    this.clearHoldTimer();
    this.pressedShardId = null;
    if (previewAlreadyUpdating) return;

    if (this.previewMode !== 'neutral' && this.previewShardId !== null) {
      this.phase = 'hovering';
    } else {
      this.phase = 'idle';
      this.previewShardId = null;
      this.previewMode = 'neutral';
    }
    this.emit();
  }

  private beginCommit(): void {
    this.clearHoldTimer();
    this.pressedShardId = null;
    this.phase = 'committing';
    this.emit();

    const { fuseMagnetize, seamFlash, solidSettle } = this.motion;

    // fuse → seam-flash milestone → settle → solid (AD-5 / UX-DR11)
    const h1 = this.clock.after(fuseMagnetize, () => {
      // Seam-flash milestone — EffectBus garnishes in Story 3.5; CSS is lossless.
      const h2 = this.clock.after(seamFlash, () => {
        const settleDelay = solidSettle;
        const finish = (): void => {
          this.phase = 'solid';
          this.previewShardId = null;
          this.previewMode = 'neutral';
          this.emit();
        };
        if (settleDelay <= 0) {
          finish();
          return;
        }
        const h3 = this.clock.after(settleDelay, finish);
        this.commitHandles.push(h3);
      });
      this.commitHandles.push(h2);
    });
    this.commitHandles.push(h1);
  }

  private clearHoldTimer(): void {
    if (this.holdHandle !== null) {
      this.clock.cancel(this.holdHandle);
      this.holdHandle = null;
    }
  }

  private clearCommitTimers(): void {
    for (const h of this.commitHandles) this.clock.cancel(h);
    this.commitHandles = [];
  }

  private clearEliminateTimers(): void {
    for (const h of this.eliminateHandles) this.clock.cancel(h);
    this.eliminateHandles = [];
  }

  private emit(): void {
    const snap = this.snapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }
}

export type { MotionProfile };
