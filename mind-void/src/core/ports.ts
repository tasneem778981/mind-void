/** Core ports: Clock · AudioPort · FxSink · Surface (AD-21). */

export type LocalPoint = { x: number; y: number };

export type SurfaceLayers = {
  vignette: HTMLElement;
  shards: SVGSVGElement;
  fx: HTMLCanvasElement;
  text: HTMLElement;
};

export interface Surface {
  readonly layers: SurfaceLayers;
  readonly width: number;
  readonly height: number;
  readonly dpr: number;
  clientToLocal(clientX: number, clientY: number): LocalPoint;
  invalidateClientRect(): void;
  dispose(): void;
}

export type ClockHandle = number;

/**
 * Injected time source (AD-5). Core never calls setTimeout / rAF.
 * `after` schedules; `invalidate` drops all pending (unmount).
 */
export interface Clock {
  now(): number;
  after(delayMs: number, callback: () => void): ClockHandle;
  cancel(handle: ClockHandle): void;
  invalidate(): void;
}

/** AudioPort surface filled in Story 3.4 (AD-11). */
export interface AudioPort {
  bedStart(): void;
  bedStopRelease(): void;
  preview(mode: 'solo' | 'mute' | 'neutral', shardIndex: number): void;
  eliminateCut(): void;
  commitChord(): void;
}

/** EffectBus / FxSink — Story 3.5. */
export interface FxSink {
  // placeholder
}
