/** Inclusive shard-count floor/ceiling for DecisionNode construction (AD-14 / Consistency Conventions). */
export const MIN_SHARD_COUNT = 2;
export const MAX_SHARD_COUNT = 5;

export function assertValidShardCount(shardCount: number): void {
  if (
    !Number.isInteger(shardCount) ||
    shardCount < MIN_SHARD_COUNT ||
    shardCount > MAX_SHARD_COUNT
  ) {
    throw new Error(
      `shardCount must be an integer in ${MIN_SHARD_COUNT}–${MAX_SHARD_COUNT}, got ${String(shardCount)}`,
    );
  }
}
