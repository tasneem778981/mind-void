import type { Intent } from './intents';
import type { MotionProfile } from './motion.generated';
import type { Clock } from './ports';
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
 * Pure interaction owner (AD-1, AD-2, AD-3).
 * Story 2.1: idle ↔ hovering + focus/preview field independence.
 * Hold / eliminate / commit land in later stories; intents are accepted and may no-op.
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

  /** Drop pending clock work (composition-root unmount). */
  dispose(): void {
    this.clock.invalidate();
    this.listeners.clear();
  }

  /** Motion profile injected at construction (AD-5). */
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
      case 'HOLD_END':
      case 'ELIMINATE':
      case 'CANCEL':
        // Wired in Epic 3 / Story 2.x resolve paths — accepted, no-op for 2.1.
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
    let nextMode = mode;
    let nextId = shardId;

    // AD-12: at two shards, mute coerces to neutral (rim inert).
    if (this.shardIds.length === 2 && nextMode === 'mute') {
      nextMode = 'neutral';
      nextId = null;
    }

    if (nextMode === 'neutral' || nextId === null) {
      if (this.phase === 'idle' && this.previewMode === 'neutral') return;
      this.previewShardId = null;
      this.previewMode = 'neutral';
      if (this.phase === 'hovering' || this.phase === 'idle') {
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
    if (this.phase === 'idle' || this.phase === 'hovering') {
      this.phase = 'hovering';
    }
    this.emit();
  }

  private emit(): void {
    const snap = this.snapshot();
    for (const listener of this.listeners) {
      listener(snap);
    }
  }
}

export type { MotionProfile };
