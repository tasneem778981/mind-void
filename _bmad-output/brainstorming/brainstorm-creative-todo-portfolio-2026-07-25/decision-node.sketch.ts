/**
 * Brainstorm sketch — DecisionNode FSM + Web InputAdapter
 * Session design artifact (pairs with fx-architecture.sketch.ts)
 */

import type { EffectBus, FxEvent, VoidCanvas } from "./fx-architecture.sketch";

/* ------------------------------------------------------------------ */
/* Domain                                                              */
/* ------------------------------------------------------------------ */

export type PreviewMode = "neutral" | "solo" | "mute";

export type DecisionPhase =
  | "idle"
  | "hovering"
  | "pressing"
  | "dragging"
  | "eliminating"
  | "committing"
  | "solid";

export interface Shard {
  id: string;
  label: string;
  /** Unit outward normal in local space (for eliminate FX). */
  outward: { x: number; y: number };
}

export interface DecisionNodeSnapshot {
  phase: DecisionPhase;
  shards: readonly Shard[];
  focusShardId: string | null;
  preview: PreviewMode;
  /** Winner id while committing / after solid handoff. */
  committedId: string | null;
}

export type DecisionListener = (snap: DecisionNodeSnapshot) => void;

export type AudioCue =
  | { type: "bed-start" }
  | { type: "bed-stop-release" }
  | { type: "preview"; mode: PreviewMode; shardId: string | null; shardIndex: number }
  | { type: "eliminate-cut"; shardId: string }
  | { type: "commit-chord"; winnerId: string };

export type AudioPort = (cue: AudioCue) => void;

/* ------------------------------------------------------------------ */
/* DecisionNode FSM — platform-agnostic                                */
/* ------------------------------------------------------------------ */

export interface DecisionNodeOptions {
  id: string;
  shards: Shard[];
  bus: EffectBus;
  /** Optional; no-ops if omitted. */
  audio?: AudioPort;
  holdMs?: number; // default 400
  onSolid?: (winner: Shard) => void;
}

type Intent =
  | { type: "POINTER_ENTER"; shardId: string; preview: PreviewMode }
  | { type: "POINTER_MOVE_PREVIEW"; shardId: string; preview: PreviewMode }
  | { type: "POINTER_LEAVE" }
  | { type: "PRESS_START"; shardId: string; x: number; y: number }
  | { type: "DRAG_MOVE"; x: number; y: number }
  | { type: "PRESS_END"; x: number; y: number }
  | { type: "ELIMINATE"; shardId: string; x: number; y: number }
  | { type: "COMMIT"; winnerId: string; x: number; y: number }
  | { type: "CANCEL" };

export class DecisionNodeFSM {
  readonly id: string;
  private shards: Shard[];
  private phase: DecisionPhase = "idle";
  private focusShardId: string | null = null;
  private preview: PreviewMode = "neutral";
  private committedId: string | null = null;
  private pressOrigin: { x: number; y: number } | null = null;
  private readonly holdMs: number;
  private readonly bus: EffectBus;
  private readonly audio: AudioPort;
  private readonly onSolid?: (winner: Shard) => void;
  private readonly listeners = new Set<DecisionListener>();
  private holdTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: DecisionNodeOptions) {
    if (options.shards.length < 2) {
      throw new Error("DecisionNode needs at least 2 shards");
    }
    this.id = options.id;
    this.shards = [...options.shards];
    this.bus = options.bus;
    this.audio = options.audio ?? (() => undefined);
    this.holdMs = options.holdMs ?? 400;
    this.onSolid = options.onSolid;
  }

  subscribe(listener: DecisionListener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  snapshot(): DecisionNodeSnapshot {
    return {
      phase: this.phase,
      shards: this.shards,
      focusShardId: this.focusShardId,
      preview: this.preview,
      committedId: this.committedId,
    };
  }

  /** Locked during eliminate/commit animations. */
  get acceptingInput(): boolean {
    return this.phase !== "eliminating" && this.phase !== "committing" && this.phase !== "solid";
  }

  dispatch(intent: Intent): void {
    if (!this.acceptingInput && intent.type !== "CANCEL") {
      // Allow only CANCEL while animating; ignore other intents.
      if (this.phase === "eliminating" || this.phase === "committing") return;
    }

    switch (intent.type) {
      case "POINTER_ENTER":
      case "POINTER_MOVE_PREVIEW":
        this.onHover(intent.shardId, intent.preview);
        break;
      case "POINTER_LEAVE":
        this.onLeave();
        break;
      case "PRESS_START":
        this.onPressStart(intent.shardId, intent.x, intent.y);
        break;
      case "DRAG_MOVE":
        this.onDragMove(intent.x, intent.y);
        break;
      case "PRESS_END":
        this.onPressEnd(intent.x, intent.y);
        break;
      case "ELIMINATE":
        this.runEliminate(intent.shardId, intent.x, intent.y);
        break;
      case "COMMIT":
        this.runCommit(intent.winnerId, intent.x, intent.y);
        break;
      case "CANCEL":
        this.resetInteraction();
        break;
    }
  }

  /* ---- transitions ------------------------------------------------ */

  private onHover(shardId: string, preview: PreviewMode): void {
    if (!this.acceptingInput) return;
    if (this.phase === "pressing" || this.phase === "dragging") return;

    const firstOpen = this.phase === "idle";
    this.phase = "hovering";
    this.focusShardId = shardId;
    this.preview = preview;

    if (firstOpen) this.audio({ type: "bed-start" });
    this.audio({
      type: "preview",
      mode: preview,
      shardId,
      shardIndex: this.indexOf(shardId),
    });
    this.emit();
  }

  private onLeave(): void {
    if (this.phase !== "hovering") return;
    this.phase = "idle";
    this.focusShardId = null;
    this.preview = "neutral";
    this.audio({ type: "preview", mode: "neutral", shardId: null, shardIndex: -1 });
    this.emit();
  }

  private onPressStart(shardId: string, x: number, y: number): void {
    if (!this.acceptingInput) return;
    this.clearHold();
    this.phase = "pressing";
    this.focusShardId = shardId;
    this.pressOrigin = { x, y };

    // Hold on body (solo zone conceptually) → COMMIT
    this.holdTimer = setTimeout(() => {
      if (this.phase === "pressing" && this.focusShardId === shardId) {
        this.runCommit(shardId, x, y);
      }
    }, this.holdMs);

    this.emit();
  }

  private onDragMove(x: number, y: number): void {
    if (this.phase !== "pressing" && this.phase !== "dragging") return;
    if (!this.pressOrigin) return;

    const dx = x - this.pressOrigin.x;
    const dy = y - this.pressOrigin.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 6) {
      this.clearHold(); // cancel hold-to-commit once dragging
      this.phase = "dragging";
      this.emit();
    }
  }

  private onPressEnd(x: number, y: number): void {
    this.clearHold();
    if (this.phase === "pressing") {
      // Short press without hold → treat as cancelled press; stay hovering if possible
      this.phase = this.focusShardId ? "hovering" : "idle";
      this.pressOrigin = null;
      this.emit();
      return;
    }
    if (this.phase === "dragging") {
      // Drop resolution is decided by InputAdapter (hit tests) via ELIMINATE/COMMIT intents.
      this.phase = this.focusShardId ? "hovering" : "idle";
      this.pressOrigin = null;
      this.emit();
    }
  }

  private runEliminate(shardId: string, x: number, y: number): void {
    if (!this.acceptingInput) return;
    const shard = this.shards.find((s) => s.id === shardId);
    if (!shard) return;

    this.clearHold();
    this.phase = "eliminating";
    this.emit();

    this.publishFx("shard-eliminate", shardId, x, y, shard.outward, 0.7);
    this.audio({ type: "eliminate-cut", shardId });

    // Animation gate — replace with onTransitionEnd in real DomView
    window.setTimeout(() => {
      this.shards = this.shards.filter((s) => s.id !== shardId);

      if (this.shards.length <= 1) {
        const winner = this.shards[0];
        if (winner) this.finishSolid(winner);
        else this.phase = "idle";
      } else {
        this.phase = "hovering";
        this.focusShardId = this.shards[0]?.id ?? null;
        this.preview = "neutral";
      }
      this.emit();
    }, 320);
  }

  private runCommit(winnerId: string, x: number, y: number): void {
    if (!this.acceptingInput) return;
    const winner = this.shards.find((s) => s.id === winnerId);
    if (!winner) return;

    this.clearHold();
    this.phase = "committing";
    this.committedId = winnerId;
    this.emit();

    this.publishFx("shard-commit", winnerId, x, y, { x: 0, y: 0 }, 1);
    this.audio({ type: "commit-chord", winnerId });

    window.setTimeout(() => {
      this.publishFx("seam-flash", winnerId, x, y, { x: 0, y: 0 }, 1);
      this.finishSolid(winner);
    }, 420);
  }

  private finishSolid(winner: Shard): void {
    this.shards = [winner];
    this.phase = "solid";
    this.committedId = winner.id;
    this.focusShardId = winner.id;
    this.preview = "neutral";
    this.audio({ type: "bed-stop-release" });
    this.emit();
    this.onSolid?.(winner);
  }

  private resetInteraction(): void {
    this.clearHold();
    if (this.phase === "solid") return;
    this.phase = "idle";
    this.focusShardId = null;
    this.preview = "neutral";
    this.pressOrigin = null;
    this.emit();
  }

  private publishFx(
    type: FxEvent["type"],
    nodeId: string,
    x: number,
    y: number,
    v: { x: number; y: number },
    intensity: number,
  ): void {
    this.bus.emit({
      type,
      nodeId: `${this.id}:${nodeId}`,
      x,
      y,
      vx: v.x,
      vy: v.y,
      intensity,
      at: performance.now(),
    });
  }

  private indexOf(shardId: string): number {
    return this.shards.findIndex((s) => s.id === shardId);
  }

  private clearHold(): void {
    if (this.holdTimer != null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
  }

  private emit(): void {
    const snap = this.snapshot();
    for (const l of this.listeners) l(snap);
  }
}

/* ------------------------------------------------------------------ */
/* Web InputAdapter — pointers → intents only                          */
/* ------------------------------------------------------------------ */

export type HitZone = "body" | "rim" | "close";

export interface ShardHit {
  shardId: string;
  zone: HitZone;
}

/**
 * Host provides hit-testing against SVG/DOM geometry.
 * Adapter never mutates view or particles.
 */
export interface HitTester {
  hit(clientX: number, clientY: number): ShardHit | null;
  /** True if pointer is outside the whole DecisionNode. */
  isOutsideNode(clientX: number, clientY: number): boolean;
  /** Distance from shard center in local px — used for drag-out eliminate. */
  dragOutDistance(shardId: string, localX: number, localY: number): number;
  /** True when dragged shard centers overlap enough to COMMIT. */
  overlapsShard(activeId: string, localX: number, localY: number): string | null;
}

export interface InputAdapterOptions {
  el: HTMLElement; // DecisionNode root (SVG/DOM)
  fsm: DecisionNodeFSM;
  voidCanvas: VoidCanvas;
  hit: HitTester;
  dragOutThresholdPx?: number; // default 56
}

export class WebInputAdapter {
  private readonly el: HTMLElement;
  private readonly fsm: DecisionNodeFSM;
  private readonly voidCanvas: VoidCanvas;
  private readonly hit: HitTester;
  private readonly dragOutThresholdPx: number;
  private pointerId: number | null = null;
  private activeShardId: string | null = null;
  private bound = false;

  constructor(options: InputAdapterOptions) {
    this.el = options.el;
    this.fsm = options.fsm;
    this.voidCanvas = options.voidCanvas;
    this.hit = options.hit;
    this.dragOutThresholdPx = options.dragOutThresholdPx ?? 56;
  }

  attach(): void {
    if (this.bound) return;
    this.bound = true;
    this.el.addEventListener("pointerdown", this.onDown);
    this.el.addEventListener("pointermove", this.onMove);
    this.el.addEventListener("pointerup", this.onUp);
    this.el.addEventListener("pointercancel", this.onCancel);
    this.el.addEventListener("pointerleave", this.onLeave);
  }

  detach(): void {
    if (!this.bound) return;
    this.bound = false;
    this.el.removeEventListener("pointerdown", this.onDown);
    this.el.removeEventListener("pointermove", this.onMove);
    this.el.removeEventListener("pointerup", this.onUp);
    this.el.removeEventListener("pointercancel", this.onCancel);
    this.el.removeEventListener("pointerleave", this.onLeave);
  }

  /* ---- zone → preview --------------------------------------------- */

  private previewForZone(zone: HitZone): PreviewMode {
    // body → solo (commit preview); rim/close → mute (eliminate preview)
    return zone === "body" ? "solo" : "mute";
  }

  private local(clientX: number, clientY: number) {
    return this.voidCanvas.clientToLocal(clientX, clientY);
  }

  /* ---- handlers --------------------------------------------------- */

  private onDown = (e: PointerEvent): void => {
    if (!this.fsm.acceptingInput) return;
    const target = this.hit.hit(e.clientX, e.clientY);
    if (!target) return;

    this.pointerId = e.pointerId;
    this.activeShardId = target.shardId;
    this.el.setPointerCapture(e.pointerId);

    const { x, y } = this.local(e.clientX, e.clientY);
    const preview = this.previewForZone(target.zone);

    this.fsm.dispatch({
      type: "POINTER_ENTER",
      shardId: target.shardId,
      preview,
    });

    // Quick click on close affordance → ELIMINATE
    if (target.zone === "close") {
      this.fsm.dispatch({ type: "ELIMINATE", shardId: target.shardId, x, y });
      this.pointerId = null;
      this.activeShardId = null;
      return;
    }

    this.fsm.dispatch({ type: "PRESS_START", shardId: target.shardId, x, y });
    this.setCursor(preview);
  };

  private onMove = (e: PointerEvent): void => {
    if (!this.fsm.acceptingInput && this.pointerId == null) return;

    // Hover (no press): update solo/mute by zone
    if (this.pointerId == null) {
      const target = this.hit.hit(e.clientX, e.clientY);
      if (!target) {
        if (this.hit.isOutsideNode(e.clientX, e.clientY)) {
          this.fsm.dispatch({ type: "POINTER_LEAVE" });
          this.setCursor("neutral");
        }
        return;
      }
      this.fsm.dispatch({
        type: "POINTER_MOVE_PREVIEW",
        shardId: target.shardId,
        preview: this.previewForZone(target.zone),
      });
      this.setCursor(this.previewForZone(target.zone));
      return;
    }

    if (e.pointerId !== this.pointerId || !this.activeShardId) return;

    const { x, y } = this.local(e.clientX, e.clientY);
    this.fsm.dispatch({ type: "DRAG_MOVE", x, y });

    // Live cursor: drag-out = repulse, overlap = attract
    const dist = this.hit.dragOutDistance(this.activeShardId, x, y);
    const overlap = this.hit.overlapsShard(this.activeShardId, x, y);
    if (overlap) this.setCursor("solo");
    else if (dist > this.dragOutThresholdPx * 0.5) this.setCursor("mute");
  };

  private onUp = (e: PointerEvent): void => {
    if (this.pointerId == null || e.pointerId !== this.pointerId) return;

    const { x, y } = this.local(e.clientX, e.clientY);
    const shardId = this.activeShardId;

    if (shardId) {
      const dist = this.hit.dragOutDistance(shardId, x, y);
      const overlapId = this.hit.overlapsShard(shardId, x, y);

      if (dist >= this.dragOutThresholdPx) {
        this.fsm.dispatch({ type: "ELIMINATE", shardId, x, y });
      } else if (overlapId) {
        this.fsm.dispatch({ type: "COMMIT", winnerId: overlapId, x, y });
      } else {
        this.fsm.dispatch({ type: "PRESS_END", x, y });
      }
    }

    this.pointerId = null;
    this.activeShardId = null;
    this.setCursor("neutral");
  };

  private onCancel = (): void => {
    this.fsm.dispatch({ type: "CANCEL" });
    this.pointerId = null;
    this.activeShardId = null;
    this.setCursor("neutral");
  };

  private onLeave = (e: PointerEvent): void => {
    // Only clear hover when not capturing a drag
    if (this.pointerId != null) return;
    this.fsm.dispatch({ type: "POINTER_LEAVE" });
    this.setCursor("neutral");
  };

  private setCursor(mode: PreviewMode): void {
    document.body.dataset.voidCursor = mode; // CSS: attract vs repulse
  }
}
