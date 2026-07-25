import { assertValidShardCount, MIN_SHARD_COUNT } from '../core/shard-count';
import { resolveMotionProfile } from '../core/resolve-motion-profile';
import type { MotionProfile } from '../core/motion.generated';
import type { Surface } from '../core/ports';
import {
  computeShardGeometry,
  DEFAULT_SEAM_CONFIG,
  deriveNodeRadius,
  type ShardGeometryResult,
} from '../core/shard-geometry';
import { DecisionNodeFSM } from '../core/decision-node-fsm';
import { VoidCanvas } from '../adapters/web/void-canvas';
import { DomView } from '../adapters/web/dom-view';
import { TimeoutClock } from '../adapters/web/raf-clock';
import '../styles/tokens.generated.css';

export type MountOpts = {
  shards?: unknown;
  shardCount?: number;
  motion?: 'auto' | 'full' | 'reduced';
  audio?: boolean;
  seed?: number;
};

export type UnmountHandle = () => void;

type TrackedListener = {
  target: EventTarget;
  type: string;
  handler: EventListener;
  options?: boolean | AddEventListenerOptions;
};

const DEFAULT_SHARD_COUNT = 3;

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

function resolveShardCount(opts: MountOpts): number {
  if (opts.shardCount !== undefined) {
    assertValidShardCount(opts.shardCount);
    return opts.shardCount;
  }
  return DEFAULT_SHARD_COUNT;
}

function shardIdsForCount(count: number): string[] {
  return Array.from(
    { length: count },
    (_, i) => `shard-${String.fromCharCode(97 + i)}`,
  );
}

export function mountMindVoid(
  root: HTMLElement,
  opts?: MountOpts | null,
): UnmountHandle {
  const options = opts ?? {};
  const shardCount = resolveShardCount(options);
  if (shardCount < MIN_SHARD_COUNT) {
    assertValidShardCount(shardCount);
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
  const view = new DomView(surface);
  const clock = new TimeoutClock();
  const fsm = new DecisionNodeFSM({
    shardIds: shardIdsForCount(shardCount),
    clock,
    motion: motionProfile,
  });

  let lastGeometry: ShardGeometryResult | null = null;

  const paint = (): void => {
    if (!lastGeometry) return;
    view.render(fsm.snapshot(), lastGeometry, motionProfile);
  };

  const unsubscribe = fsm.subscribe(() => {
    paint();
  });

  const layout = (): void => {
    const w = surface.width;
    const h = surface.height;
    if (w < 2 || h < 2) return;

    const nodeRadius = deriveNodeRadius(w, h);
    const nodeCenter = { x: w / 2, y: h / 2 };
    lastGeometry = computeShardGeometry(
      shardCount,
      nodeRadius,
      nodeCenter,
      DEFAULT_SEAM_CONFIG,
    );
    paint();
  };

  const resizeObserver = new ResizeObserver(() => {
    surface.invalidateClientRect();
    layout();
  });
  resizeObserver.observe(shell);
  layout();

  let alive = true;
  const listeners: TrackedListener[] = [];
  let rafId: number | null = null;

  const clearFx = (): void => {
    /* EffectBus — Epic 3 */
  };
  const stopAudio = (): void => {
    /* AudioPort — Epic 3 */
  };

  return () => {
    if (!alive) return;
    alive = false;

    resizeObserver.disconnect();
    unsubscribe();
    view.clear();
    fsm.dispose();

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
    clock.invalidate();
    surface.dispose();
    shell.remove();
  };
}
