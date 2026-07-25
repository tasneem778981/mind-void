import { describe, expect, it } from 'vitest';
import { motionFull, motionReduced } from '../src/core/motion.generated';
import { resolveMotionProfile } from '../src/core/resolve-motion-profile';

describe('resolveMotionProfile', () => {
  it('returns full when preference is full', () => {
    expect(resolveMotionProfile('full', true)).toBe(motionFull);
    expect(resolveMotionProfile('full', false)).toBe(motionFull);
  });

  it('returns reduced when preference is reduced', () => {
    expect(resolveMotionProfile('reduced', false)).toBe(motionReduced);
  });

  it('auto follows prefers-reduced-motion', () => {
    expect(resolveMotionProfile('auto', true)).toBe(motionReduced);
    expect(resolveMotionProfile('auto', false)).toBe(motionFull);
    expect(resolveMotionProfile(undefined, true)).toBe(motionReduced);
  });
});

describe('motionReduced (AD-5 / UX-DR15)', () => {
  it('keeps holdCommit and seamFlash; compresses travel; switches off pulse/ambient/overshoot', () => {
    expect(motionReduced.holdCommit).toBe(400);
    expect(motionReduced.seamFlash).toBe(120);
    expect(motionReduced.eliminateDissolve).toBe(120);
    expect(motionReduced.redistribute).toBe(0);
    expect(motionReduced.fuseMagnetize).toBe(120);
    expect(motionReduced.solidSettle).toBe(0);
    expect(motionReduced.idlePulse).toBe(false);
    expect(motionReduced.ambientDrift).toBe(false);
    expect(motionReduced.settleOvershoot).toBe(false);
  });

  it('full profile enables pulse/ambient/overshoot', () => {
    expect(motionFull.idlePulse).toBe(true);
    expect(motionFull.ambientDrift).toBe(true);
    expect(motionFull.settleOvershoot).toBe(true);
    expect(motionFull.eliminateDissolve).toBe(220);
  });
});
