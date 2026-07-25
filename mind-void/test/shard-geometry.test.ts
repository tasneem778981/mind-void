import { describe, expect, it } from 'vitest';
import {
  computeShardGeometry,
  DEFAULT_SEAM_CONFIG,
  deriveNodeRadius,
} from '../src/core/shard-geometry';

const center = { x: 200, y: 150 };

describe('computeShardGeometry', () => {
  it('builds binary layout with two shards offset along seam normal', () => {
    const geo = computeShardGeometry(2, 100, center);
    expect(geo.shards).toHaveLength(2);
    expect(geo.shards[0]!.id).toBe('shard-a');
    expect(geo.shards[1]!.id).toBe('shard-b');
    expect(geo.shards[0]!.placeX).toBe(center.x - DEFAULT_SEAM_CONFIG.gapPx);
    expect(geo.shards[1]!.placeX).toBe(center.x + DEFAULT_SEAM_CONFIG.gapPx);
    expect(geo.shards[0]!.body.length).toBeGreaterThan(3);
    expect(geo.shards[0]!.rim.length).toBeGreaterThan(3);
    expect(
      Math.hypot(
        geo.shards[0]!.outwardNormal.x,
        geo.shards[0]!.outwardNormal.y,
      ),
    ).toBeCloseTo(1);
    expect(geo.seams).toHaveLength(1);
  });

  it('builds radial layouts for 3–5 with bisector offsets', () => {
    for (const n of [3, 4, 5] as const) {
      const geo = computeShardGeometry(n, 80, center);
      expect(geo.shards).toHaveLength(n);
      for (const shard of geo.shards) {
        const dx = shard.placeX - center.x;
        const dy = shard.placeY - center.y;
        expect(Math.hypot(dx, dy)).toBeCloseTo(DEFAULT_SEAM_CONFIG.gapPx, 5);
        expect(shard.rim.length).toBeGreaterThan(3);
        expect(shard.centroid).toBeDefined();
      }
      expect(geo.seams.length).toBe(n);
    }
  });

  it('rejects invalid shard counts', () => {
    expect(() => computeShardGeometry(1, 50, center)).toThrow(/shardCount/);
    expect(() => computeShardGeometry(6, 50, center)).toThrow(/shardCount/);
  });
});

describe('deriveNodeRadius', () => {
  it('scales with the smaller surface edge', () => {
    expect(deriveNodeRadius(800, 600)).toBeCloseTo(600 * 0.22);
    expect(deriveNodeRadius(100, 100)).toBeGreaterThanOrEqual(48);
  });
});
