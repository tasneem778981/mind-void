import { assertValidShardCount } from '../core/shard-count';
import { resolveMotionProfile } from '../core/resolve-motion-profile';
import type { MotionProfile } from '../core/motion.generated';
import type { Surface } from '../core/ports';
import { VoidCanvas } from '../adapters/web/void-canvas';
import '../styles/tokens.generated.css';

/**
 * Exact public configuration surface (AD-14).
 * `nodeRadius` is never an option — derived from surface size later.
 */
export type MountOpts = {
  shards?: unknown;
  shardCount?: number;
  motion?: 'auto' | 'full' | 'reduced';
  audio?: boolean;
  seed?: number;
};

/** Detach listeners, cancel rAF, clear FX, stop audio, invalidate clock. */
export type UnmountHandle = () => void;

type TrackedListener = {
  target: EventTarget;
  type: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
};

function readPrefersReducedMotion(): boolean {
  if (typeof matchMedia !== 'function') return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyMotionProfileCssVars(
  target: HTMLElement,
  profile: MotionProfile,
): void {
  const style = target.style;
  style.setProperty('--mv-profile-hold-commit', `${profile.holdCommit}ms`);
  style.setProperty(
    '--mv-profile-eliminate-dissolve',
    `${profile.eliminateDissolve}ms`,
  );
  style.setProperty('--mv-profile-redistribute', `${profile.redistribute}ms`);
  style.setProperty(
    '--mv-profile-fuse-magnetize',
    `${profile.fuseMagnetize}ms`,
  );
  style.setProperty('--mv-profile-seam-flash', `${profile.seamFlash}ms`);
  style.setProperty('--mv-profile-solid-settle', `${profile.solidSettle}ms`);
  style.setProperty('--mv-profile-thesis-hold', `${profile.thesisHold}ms`);
  style.setProperty('--mv-profile-preview-in', `${profile.previewIn}ms`);
  style.setProperty('--mv-profile-preview-out', `${profile.previewOut}ms`);
  style.setProperty('--mv-profile-pulse-idle', `${profile.pulseIdle}ms`);
  style.setProperty('--mv-profile-ease-calm', profile.easeCalm);
  style.setProperty('--mv-profile-ease-magnetize', profile.easeMagnetize);
  style.setProperty('--mv-profile-idle-pulse', profile.idlePulse ? '1' : '0');
  style.setProperty(
    '--mv-profile-ambient-drift',
    profile.ambientDrift ? '1' : '0',
  );
  style.setProperty(
    '--mv-profile-settle-overshoot',
    profile.settleOvershoot ? '1' : '0',
  );
}

/**
 * Sole composition root (AD-1, AD-14). Constructs collaborators here only —
 * no import-time singletons.
 */
export function mountMindVoid(
  root: HTMLElement,
  opts?: MountOpts | null,
): UnmountHandle {
  const options = opts ?? {};

  if (options.shardCount !== undefined) {
    assertValidShardCount(options.shardCount);
  }

  const motionProfile = resolveMotionProfile(
    options.motion,
    readPrefersReducedMotion(),
  );

  for (const orphan of root.querySelectorAll(':scope > [data-mind-void]')) {
    orphan.remove();
  }

  const shell = document.createElement('div');
  shell.dataset.mindVoid = '';
  shell.className = 'mv-shell';
  applyMotionProfileCssVars(shell, motionProfile);
  root.appendChild(shell);

  const surface: Surface = new VoidCanvas(shell);

  let alive = true;
  const listeners: TrackedListener[] = [];
  let rafId: number | null = null;

  const clearFx = (): void => {
    /* EffectBus — Epic 3 */
  };
  const stopAudio = (): void => {
    /* AudioPort — Epic 3 */
  };
  const invalidateClock = (): void => {
    /* Clock — Epic 3 */
  };

  return () => {
    if (!alive) return;
    alive = false;

    for (const { target, type, handler, options: listenerOpts } of listeners) {
      target.removeEventListener(type, handler, listenerOpts);
    }
    listeners.length = 0;

    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    clearFx();
    stopAudio();
    invalidateClock();
    surface.dispose();
    shell.remove();
  };
}
