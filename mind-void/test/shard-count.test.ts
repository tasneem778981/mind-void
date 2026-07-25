import { describe, expect, it } from 'vitest';
import {
  assertValidShardCount,
  MAX_SHARD_COUNT,
  MIN_SHARD_COUNT,
} from '../src/core/shard-count';

describe('assertValidShardCount', () => {
  it('accepts integers in 2–5 inclusive', () => {
    for (let n = MIN_SHARD_COUNT; n <= MAX_SHARD_COUNT; n++) {
      expect(() => assertValidShardCount(n)).not.toThrow();
    }
  });

  it('throws below 2 and above 5', () => {
    expect(() => assertValidShardCount(1)).toThrow(/shardCount/);
    expect(() => assertValidShardCount(6)).toThrow(/shardCount/);
  });

  it('throws for non-integers', () => {
    expect(() => assertValidShardCount(2.5)).toThrow(/shardCount/);
    expect(() => assertValidShardCount(Number.NaN)).toThrow(/shardCount/);
  });
});
