import type { PreviewMode } from './snapshot';

export type PointHint = { x: number; y: number };

/** Device-neutral intents — no COMMIT (AD-4). */
export type Intent =
  | { type: 'FOCUS_SET'; shardId: string | null }
  | {
      type: 'PREVIEW_SET';
      shardId: string | null;
      mode: PreviewMode;
      at?: PointHint;
    }
  | { type: 'HOLD_START'; shardId: string; at?: PointHint }
  | { type: 'HOLD_END'; at?: PointHint }
  | { type: 'ELIMINATE'; shardId: string; at?: PointHint }
  | { type: 'CANCEL' };
