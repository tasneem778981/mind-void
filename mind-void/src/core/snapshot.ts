export type PreviewMode = 'neutral' | 'solo' | 'mute';

export type DecisionPhase =
  | 'idle'
  | 'hovering'
  | 'pressing'
  | 'eliminating'
  | 'redistributing'
  | 'committing'
  | 'solid';

/** Readonly snapshot — DomView input only (AD-2). Expanded in Epic 2+. */
export type DecisionNodeSnapshot = {
  readonly phase: DecisionPhase;
  readonly shardIds: readonly string[];
  readonly focusedShardId: string | null;
  readonly previewShardId: string | null;
  readonly previewMode: PreviewMode;
  readonly pressedShardId: string | null;
};

export function createIdleSnapshot(
  shardIds: readonly string[],
): DecisionNodeSnapshot {
  return {
    phase: 'idle',
    shardIds,
    focusedShardId: null,
    previewShardId: null,
    previewMode: 'neutral',
    pressedShardId: null,
  };
}
