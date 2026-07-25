import { motionFull, motionReduced, type MotionProfile } from './motion.generated';

export type MotionPreference = 'auto' | 'full' | 'reduced';

/**
 * Selects the injected MotionProfile (AD-5). Phase graph is unchanged;
 * reduced disables pulse/ambient/overshoot by data.
 */
export function resolveMotionProfile(
  preference: MotionPreference | undefined,
  prefersReducedMotion: boolean,
): MotionProfile {
  const mode = preference ?? 'auto';
  if (mode === 'full') return motionFull;
  if (mode === 'reduced') return motionReduced;
  return prefersReducedMotion ? motionReduced : motionFull;
}
