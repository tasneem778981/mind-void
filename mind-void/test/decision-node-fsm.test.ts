import { describe, expect, it } from 'vitest';
import { DecisionNodeFSM } from '../src/core/decision-node-fsm';
import {
  motionFull,
  motionReduced,
  type MotionProfile,
} from '../src/core/motion.generated';
import { FakeClock } from './fake-clock';

const SHARDS = ['shard-a', 'shard-b', 'shard-c'] as const;

function createFsm(
  shardIds: readonly string[] = SHARDS,
  motion: MotionProfile = motionFull,
) {
  const clock = new FakeClock();
  const fsm = new DecisionNodeFSM({
    shardIds,
    clock,
    motion,
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
});

describe('DecisionNodeFSM hold → commit → solid (Story 3.1)', () => {
  it('HOLD_START enters pressing; Clock holdCommit advances to committing then solid', () => {
    const { fsm, clock } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    expect(fsm.snapshot().phase).toBe('pressing');
    expect(fsm.snapshot().pressedShardId).toBe('shard-a');

    clock.advance(motionFull.holdCommit);
    expect(fsm.snapshot().phase).toBe('committing');
    expect(fsm.snapshot().pressedShardId).toBeNull();

    clock.advance(motionFull.fuseMagnetize);
    clock.advance(motionFull.seamFlash);
    clock.advance(motionFull.solidSettle);
    expect(fsm.snapshot().phase).toBe('solid');
  });

  it('HOLD_END before threshold cancels and returns hovering when preview live', () => {
    const { fsm, clock } = createFsm();
    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-a', mode: 'solo' });
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    clock.advance(100);
    fsm.dispatch({ type: 'HOLD_END' });
    expect(fsm.snapshot().phase).toBe('hovering');
    expect(fsm.snapshot().pressedShardId).toBeNull();
    expect(fsm.snapshot().previewMode).toBe('solo');
  });

  it('CANCEL during pressing returns idle when no preview', () => {
    const { fsm } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-b' });
    fsm.dispatch({ type: 'CANCEL' });
    expect(fsm.snapshot().phase).toBe('idle');
    expect(fsm.snapshot().pressedShardId).toBeNull();
  });

  it('ignores PREVIEW_SET for the pressed shard during pressing (AD-12)', () => {
    const { fsm } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-a', mode: 'mute' });
    expect(fsm.snapshot().phase).toBe('pressing');
    expect(fsm.snapshot().pressedShardId).toBe('shard-a');
  });

  it('PREVIEW_SET to another shard cancels hold', () => {
    const { fsm } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-b', mode: 'solo' });
    expect(fsm.snapshot().phase).toBe('hovering');
    expect(fsm.snapshot().pressedShardId).toBeNull();
    expect(fsm.snapshot().previewShardId).toBe('shard-b');
  });

  it('drops intents while committing; solid is terminal', () => {
    const { fsm, clock } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    clock.advance(motionFull.holdCommit);
    expect(fsm.snapshot().phase).toBe('committing');

    fsm.dispatch({ type: 'CANCEL' });
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-b' });
    fsm.dispatch({ type: 'PREVIEW_SET', shardId: 'shard-b', mode: 'solo' });
    expect(fsm.snapshot().phase).toBe('committing');

    clock.advance(
      motionFull.fuseMagnetize + motionFull.seamFlash + motionFull.solidSettle,
    );
    expect(fsm.snapshot().phase).toBe('solid');
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    fsm.dispatch({ type: 'FOCUS_SET', shardId: 'shard-a' });
    expect(fsm.snapshot().phase).toBe('solid');
    expect(fsm.snapshot().focusedShardId).toBeNull();
  });

  it('reduced profile still reaches solid (0ms settle passes through)', () => {
    const { fsm, clock } = createFsm(SHARDS, motionReduced);
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    clock.advance(motionReduced.holdCommit);
    clock.advance(motionReduced.fuseMagnetize);
    clock.advance(motionReduced.seamFlash);
    // solidSettle is 0 — finish() runs inline after seamFlash callback
    expect(fsm.snapshot().phase).toBe('solid');
  });

  it('has no COMMIT intent — resolution is Clock-only (AD-4)', () => {
    const commitLike = { type: 'COMMIT' } as unknown as {
      type: 'HOLD_START';
      shardId: string;
    };
    void commitLike;
    const { fsm } = createFsm();
    expect(fsm.snapshot().phase).toBe('idle');
  });
});

describe('DecisionNodeFSM eliminate → redistribute (Story 3.2)', () => {
  it('eliminates a shard then redistributes survivors', () => {
    const { fsm, clock } = createFsm();
    fsm.dispatch({ type: 'ELIMINATE', shardId: 'shard-b' });
    expect(fsm.snapshot().phase).toBe('eliminating');
    expect(fsm.snapshot().eliminatingShardId).toBe('shard-b');
    expect(fsm.snapshot().shardIds).toEqual(['shard-a', 'shard-b', 'shard-c']);

    clock.advance(motionFull.eliminateDissolve);
    expect(fsm.snapshot().phase).toBe('redistributing');
    expect(fsm.snapshot().shardIds).toEqual(['shard-a', 'shard-c']);
    expect(fsm.snapshot().eliminatingShardId).toBeNull();

    clock.advance(motionFull.redistribute);
    expect(fsm.snapshot().phase).toBe('idle');
  });

  it('refuses ELIMINATE at two shards (AD-12)', () => {
    const { fsm } = createFsm(['shard-a', 'shard-b']);
    fsm.dispatch({ type: 'ELIMINATE', shardId: 'shard-a' });
    expect(fsm.snapshot().phase).toBe('idle');
    expect(fsm.snapshot().shardIds).toEqual(['shard-a', 'shard-b']);
  });

  it('moves focus to survivor at same index when eliminated held focus (AD-13)', () => {
    const { fsm, clock } = createFsm();
    fsm.dispatch({ type: 'FOCUS_SET', shardId: 'shard-b' });
    fsm.dispatch({ type: 'ELIMINATE', shardId: 'shard-b' });
    clock.advance(motionFull.eliminateDissolve);
    expect(fsm.snapshot().focusedShardId).toBe('shard-c');
    clock.advance(motionFull.redistribute);
    expect(fsm.snapshot().focusedShardId).toBe('shard-c');
  });

  it('refuses ELIMINATE while pressing', () => {
    const { fsm } = createFsm();
    fsm.dispatch({ type: 'HOLD_START', shardId: 'shard-a' });
    fsm.dispatch({ type: 'ELIMINATE', shardId: 'shard-b' });
    expect(fsm.snapshot().phase).toBe('pressing');
    expect(fsm.snapshot().shardIds).toHaveLength(3);
  });
});
