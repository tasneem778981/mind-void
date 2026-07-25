import { describe, expect, it } from 'vitest';
import { DecisionNodeFSM } from '../src/core/decision-node-fsm';
import { motionFull } from '../src/core/motion.generated';
import { FakeClock } from './fake-clock';

const SHARDS = ['shard-a', 'shard-b', 'shard-c'] as const;

function createFsm(shardIds: readonly string[] = SHARDS) {
  const clock = new FakeClock();
  const fsm = new DecisionNodeFSM({
    shardIds,
    clock,
    motion: motionFull,
  });
  return { fsm, clock };
}

describe('DecisionNodeFSM idle ↔ hovering', () => {
  it('starts idle with independent null focus/preview/pressed', () => {
    const { fsm } = createFsm();
    const snap = fsm.snapshot();
    expect(snap.phase).toBe('idle');
    expect(snap.focusedShardId).toBeNull();
    expect(snap.previewShardId).toBeNull();
    expect(snap.previewMode).toBe('neutral');
    expect(snap.pressedShardId).toBeNull();
  });

  it('PREVIEW_SET solo/mute enters hovering; neutral returns idle', () => {
    const { fsm } = createFsm();

    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-a', mode: 'solo' });
    expect(fsm.snapshot().phase).toBe('hovering');
    expect(fsm.snapshot().previewShardId).toBe('shard-a');
    expect(fsm.snapshot().previewMode).toBe('solo');

    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-b', mode: 'mute' });
    expect(fsm.snapshot().phase).toBe('hovering');
    expect(fsm.snapshot().previewShardId).toBe('shard-b');
    expect(fsm.snapshot().previewMode).toBe('mute');

    fsm.dispatch({ type: 'PREVIEW_SET', shardId: null, mode: 'neutral' });
    expect(fsm.snapshot().phase).toBe('idle');
    expect(fsm.snapshot().previewMode).toBe('neutral');
    expect(fsm.snapshot().previewShardId).toBeNull();
  });

  it('FOCUS_SET does not set preview (AD-8 field independence)', () => {
    const { fsm } = createFsm();
    fsm.dispatch({ type: 'FOCUS_SET', shardId: 'shard-c' });
    let snap = fsm.snapshot();
    expect(snap.focusedShardId).toBe('shard-c');
    expect(snap.previewMode).toBe('neutral');
    expect(snap.phase).toBe('idle');

    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-a', mode: 'solo' });
    snap = fsm.snapshot();
    expect(snap.focusedShardId).toBe('shard-c');
    expect(snap.previewShardId).toBe('shard-a');
    expect(snap.previewMode).toBe('solo');
    expect(snap.phase).toBe('hovering');
  });

  it('coerces mute to neutral when only two shards (AD-12)', () => {
    const { fsm } = createFsm(['shard-a', 'shard-b']);
    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-a', mode: 'mute' });
    const snap = fsm.snapshot();
    expect(snap.previewMode).toBe('neutral');
    expect(snap.phase).toBe('idle');
  });

  it('has no COMMIT intent type and accepts the locked intent set', () => {
    const { fsm } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    fsm.dispatch({ type: 'HOLD_END' });
    fsm.dispatch({ type: 'ELIMINATE', shardId: 'shard-a' });
    fsm.dispatch({ type: 'CANCEL' });
    expect(fsm.snapshot().phase).toBe('idle');
  });
});
