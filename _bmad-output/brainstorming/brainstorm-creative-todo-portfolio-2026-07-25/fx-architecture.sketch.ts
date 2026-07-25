/**
 * Brainstorm sketch — VoidCanvas / EffectBus / ParticleEngine
 * Not production app code yet; session design artifact.
 */

/* ------------------------------------------------------------------ */
/* Shared types                                                        */
/* ------------------------------------------------------------------ */

export type FxEventType =
  | "shard-eliminate"
  | "shard-commit"
  | "seam-flash"
  | "seal-burst"
  | "ambient-spark";

/** Coordinates are always in VoidCanvas local space. */
export interface FxEvent {
  type: FxEventType;
  nodeId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  intensity: number; // 0..1
  at: number; // performance.now()
}

export type FxListener = (event: FxEvent) => void;

export interface SpaceTransform {
  /** CSS pixel size of the void */
  width: number;
  height: number;
  /** devicePixelRatio used for canvas backing store */
  dpr: number;
}

/* ------------------------------------------------------------------ */
/* EffectBus — VoidCanvas-level pub/sub + bounded drop-oldest queue    */
/* ------------------------------------------------------------------ */

export interface EffectBusOptions {
  /** Max in-flight / pending FX bursts. Default 4. */
  capacity?: number;
}

export class EffectBus {
  private readonly capacity: number;
  private readonly queue: FxEvent[] = [];
  private readonly listeners = new Set<FxListener>();

  constructor(options: EffectBusOptions = {}) {
    this.capacity = options.capacity ?? 4;
  }

  subscribe(listener: FxListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** FSM calls this — never the canvas, never DOM view. */
  emit(event: FxEvent): void {
    if (this.queue.length >= this.capacity) {
      this.queue.shift(); // drop-oldest
    }
    this.queue.push(event);
    for (const listener of this.listeners) listener(event);
  }

  /** Optional: ParticleEngine can drain/ack if you want explicit lifecycle. */
  peekQueue(): readonly FxEvent[] {
    return this.queue;
  }

  /** Remove a finished burst from the bounded set (by reference or timestamp). */
  acknowledge(at: number): void {
    const i = this.queue.findIndex((e) => e.at === at);
    if (i >= 0) this.queue.splice(i, 1);
  }

  clear(): void {
    this.queue.length = 0;
  }
}

/* ------------------------------------------------------------------ */
/* ParticleEngine — canvas-only consumer                               */
/* ------------------------------------------------------------------ */

export interface ParticleEngineOptions {
  canvas: HTMLCanvasElement;
  bus: EffectBus;
  getSpace: () => SpaceTransform;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1 → 0
  decay: number;
  size: number;
}

export class ParticleEngine {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly bus: EffectBus;
  private readonly getSpace: () => SpaceTransform;
  private readonly particles: Particle[] = [];
  private raf = 0;
  private unsub: (() => void) | null = null;
  private running = false;

  constructor(options: ParticleEngineOptions) {
    const ctx = options.canvas.getContext("2d");
    if (!ctx) throw new Error("2d context unavailable");
    this.canvas = options.canvas;
    this.ctx = ctx;
    this.bus = options.bus;
    this.getSpace = options.getSpace;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.unsub = this.bus.subscribe((e) => this.spawnFromEvent(e));
    this.resize();
    const tick = () => {
      this.frame();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.unsub?.();
    this.unsub = null;
  }

  resize(): void {
    const { width, height, dpr } = this.getSpace();
    this.canvas.width = Math.max(1, Math.floor(width * dpr));
    this.canvas.height = Math.max(1, Math.floor(height * dpr));
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private spawnFromEvent(event: FxEvent): void {
    const count = Math.round(8 + event.intensity * 24);
    for (let i = 0; i < count; i++) {
      const jitter = (Math.random() - 0.5) * 0.6;
      this.particles.push({
        x: event.x,
        y: event.y,
        vx: event.vx + jitter,
        vy: event.vy + jitter,
        life: 1,
        decay: 0.02 + Math.random() * 0.03,
        size: 1 + event.intensity * 3 * Math.random(),
      });
    }
  }

  private frame(): void {
    const { width, height } = this.getSpace();
    this.ctx.clearRect(0, 0, width, height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      this.ctx.globalAlpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = "#c8f7ff";
      this.ctx.fill();
    }
    this.ctx.globalAlpha = 1;
  }
}

/* ------------------------------------------------------------------ */
/* VoidCanvas shell — owns space sync + layers                         */
/* ------------------------------------------------------------------ */

export interface VoidCanvasOptions {
  root: HTMLElement;
  fxCapacity?: number;
}

export class VoidCanvas {
  readonly root: HTMLElement;
  readonly domLayer: HTMLElement;
  readonly svgLayer: SVGSVGElement;
  readonly canvas: HTMLCanvasElement;
  readonly bus: EffectBus;
  readonly particles: ParticleEngine;

  private space: SpaceTransform = { width: 0, height: 0, dpr: 1 };
  private dirty = true;
  private ro: ResizeObserver | null = null;

  constructor(options: VoidCanvasOptions) {
    this.root = options.root;
    this.root.classList.add("void-canvas");
    this.root.style.position = "relative";
    this.root.style.overflow = "hidden";

    this.domLayer = document.createElement("div");
    this.domLayer.className = "void-dom";
    this.domLayer.style.position = "absolute";
    this.domLayer.style.inset = "0";

    this.svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.svgLayer.classList.add("void-svg");
    this.svgLayer.style.position = "absolute";
    this.svgLayer.style.inset = "0";
    this.svgLayer.style.width = "100%";
    this.svgLayer.style.height = "100%";

    this.canvas = document.createElement("canvas");
    this.canvas.className = "void-fx";
    this.canvas.style.position = "absolute";
    this.canvas.style.inset = "0";
    this.canvas.style.pointerEvents = "none"; // hit-testing stays on DOM/SVG

    this.domLayer.appendChild(this.svgLayer);
    this.root.appendChild(this.domLayer);
    this.root.appendChild(this.canvas);

    this.bus = new EffectBus({ capacity: options.fxCapacity ?? 4 });
    this.particles = new ParticleEngine({
      canvas: this.canvas,
      bus: this.bus,
      getSpace: () => this.getSpace(),
    });
  }

  mount(): void {
    this.syncSpace();
    this.ro = new ResizeObserver(() => {
      this.dirty = true;
      this.syncSpace();
      this.particles.resize();
    });
    this.ro.observe(this.root);
    this.particles.start();
  }

  unmount(): void {
    this.ro?.disconnect();
    this.ro = null;
    this.particles.stop();
    this.bus.clear();
  }

  getSpace(): SpaceTransform {
    if (this.dirty) this.syncSpace();
    return this.space;
  }

  /** Client/page → VoidCanvas local space (FSM uses this once per intent). */
  clientToLocal(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.root.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  private syncSpace(): void {
    const rect = this.root.getBoundingClientRect();
    this.space = {
      width: rect.width,
      height: rect.height,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };
    this.svgLayer.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    this.dirty = false;
  }
}

/* ------------------------------------------------------------------ */
/* Example FSM → bus publish (sketch)                                  */
/* ------------------------------------------------------------------ */

export function publishEliminate(
  bus: EffectBus,
  voidSpace: VoidCanvas,
  nodeId: string,
  clientX: number,
  clientY: number,
  outwardNormal: { x: number; y: number },
): void {
  const { x, y } = voidSpace.clientToLocal(clientX, clientY);
  bus.emit({
    type: "shard-eliminate",
    nodeId,
    x,
    y,
    vx: outwardNormal.x * 2,
    vy: outwardNormal.y * 2,
    intensity: 0.7,
    at: performance.now(),
  });
}
