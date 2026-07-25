/** Core ports: Clock · AudioPort · FxSink · Surface (AD-21). */

export type LocalPoint = { x: number; y: number };

/**
 * Layer handles are opaque to core consumers — typed here so Surface is complete.
 * Runtime elements are created only in the web adapter ring.
 */
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
  /** Force rect refresh at gesture start (AD-6). */
  invalidateClientRect(): void;
  dispose(): void;
}

/** Placeholders for later stories. */
export interface Clock {
  // Epic 3
}

export interface AudioPort {
  // Story 3.4
}

export interface FxSink {
  // Story 3.5
}
