import { assertValidShardCount } from './shard-count';

export type Point = { x: number; y: number };

export type SeamConfig = {
  gapPx: number;
  rimBandPx: number;
};

export const DEFAULT_SEAM_CONFIG: SeamConfig = {
  gapPx: 3,
  rimBandPx: 14,
};

export type ShardPiece = {
  id: string;
  index: number;
  /** Polygon in node-local coordinates (origin = node centre before place). */
  body: readonly Point[];
  /** Outer rim-band polygon in node-local coordinates. */
  rim: readonly Point[];
  centroid: Point;
  outwardNormal: Point;
  /** Canvas-local translation for the shard group (AD-22). */
  placeX: number;
  placeY: number;
};

export type ShardGeometryResult = {
  shards: readonly ShardPiece[];
  /** Seam polylines in canvas-local space (drawn over fills). */
  seams: readonly (readonly Point[])[];
  nodeCenter: Point;
  nodeRadius: number;
};

function shardId(index: number): string {
  return `shard-${String.fromCharCode(97 + index)}`;
}

function add(a: Point, b: Point): Point {
  return { x: a.x + b.x, y: a.y + b.y };
}

function scale(p: Point, s: number): Point {
  return { x: p.x * s, y: p.y * s };
}

function normalize(p: Point): Point {
  const len = Math.hypot(p.x, p.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: p.x / len, y: p.y / len };
}

function centroidOf(points: readonly Point[]): Point {
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  const n = points.length || 1;
  return { x: x / n, y: y / n };
}

function arcPoints(
  radius: number,
  a0: number,
  a1: number,
  steps: number,
): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + (a1 - a0) * t;
    pts.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
  }
  return pts;
}

function wedgeBody(radius: number, a0: number, a1: number): Point[] {
  const steps = Math.max(8, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 48));
  return [{ x: 0, y: 0 }, ...arcPoints(radius, a0, a1, steps)];
}

function wedgeRim(
  radius: number,
  rimBand: number,
  a0: number,
  a1: number,
): Point[] {
  const inner = Math.max(0, radius - rimBand);
  const steps = Math.max(8, Math.ceil(((a1 - a0) / (Math.PI * 2)) * 48));
  const outer = arcPoints(radius, a0, a1, steps);
  const innerArc = arcPoints(inner, a1, a0, steps);
  return [...outer, ...innerArc];
}

function halfDiskBody(radius: number, side: 'left' | 'right'): Point[] {
  const a0 = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  const a1 = side === 'left' ? (Math.PI * 3) / 2 : Math.PI / 2;
  const steps = 24;
  return [{ x: 0, y: 0 }, ...arcPoints(radius, a0, a1, steps)];
}

function halfDiskRim(
  radius: number,
  rimBand: number,
  side: 'left' | 'right',
): Point[] {
  const a0 = side === 'left' ? Math.PI / 2 : -Math.PI / 2;
  const a1 = side === 'left' ? (Math.PI * 3) / 2 : Math.PI / 2;
  return wedgeRim(radius, rimBand, a0, a1);
}

/**
 * Pure geometry owner (AD-6, AD-22).
 * Polygons are node-local; `placeX/Y` positions each group in canvas space.
 */
export function computeShardGeometry(
  shardCount: number,
  nodeRadius: number,
  nodeCenter: Point,
  seamConfig: SeamConfig = DEFAULT_SEAM_CONFIG,
): ShardGeometryResult {
  assertValidShardCount(shardCount);
  if (!(nodeRadius > 0)) {
    throw new Error(`nodeRadius must be positive, got ${String(nodeRadius)}`);
  }

  const { gapPx, rimBandPx } = seamConfig;
  const shards: ShardPiece[] = [];
  const seams: Point[][] = [];

  if (shardCount === 2) {
    // Binary: vertical seam; offset along seam normal (±X).
    const normal = { x: 1, y: 0 };
    const sides: Array<'left' | 'right'> = ['left', 'right'];
    for (let i = 0; i < 2; i++) {
      const side = sides[i]!;
      const sign = side === 'left' ? -1 : 1;
      const body = halfDiskBody(nodeRadius, side);
      const rim = halfDiskRim(nodeRadius, rimBandPx, side);
      const offset = scale(normal, sign * gapPx);
      const outward = normalize(offset);
      shards.push({
        id: shardId(i),
        index: i,
        body,
        rim,
        centroid: centroidOf(body),
        outwardNormal: outward,
        placeX: nodeCenter.x + offset.x,
        placeY: nodeCenter.y + offset.y,
      });
    }
    seams.push([
      add(nodeCenter, { x: 0, y: -nodeRadius }),
      add(nodeCenter, { x: 0, y: nodeRadius }),
    ]);
  } else {
    const slice = (Math.PI * 2) / shardCount;
    for (let i = 0; i < shardCount; i++) {
      const a0 = -Math.PI / 2 + i * slice;
      const a1 = a0 + slice;
      const mid = (a0 + a1) / 2;
      const bisector = { x: Math.cos(mid), y: Math.sin(mid) };
      const offset = scale(bisector, gapPx);
      const body = wedgeBody(nodeRadius, a0, a1);
      const rim = wedgeRim(nodeRadius, rimBandPx, a0, a1);
      shards.push({
        id: shardId(i),
        index: i,
        body,
        rim,
        centroid: centroidOf(body),
        outwardNormal: normalize(bisector),
        placeX: nodeCenter.x + offset.x,
        placeY: nodeCenter.y + offset.y,
      });
      seams.push([
        { ...nodeCenter },
        add(nodeCenter, {
          x: Math.cos(a0) * nodeRadius,
          y: Math.sin(a0) * nodeRadius,
        }),
      ]);
    }
  }

  return { shards, seams, nodeCenter, nodeRadius };
}

export function deriveNodeRadius(surfaceWidth: number, surfaceHeight: number): number {
  const m = Math.min(surfaceWidth, surfaceHeight);
  return Math.max(48, Math.min(m * 0.22, m * 0.4));
}

export function pointsToSvgPath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  let d = `M ${first!.x} ${first!.y}`;
  for (const p of rest) {
    d += ` L ${p.x} ${p.y}`;
  }
  return `${d} Z`;
}

export function polylineToSvgPath(points: readonly Point[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  let d = `M ${first!.x} ${first!.y}`;
  for (const p of rest) {
    d += ` L ${p.x} ${p.y}`;
  }
  return d;
}
