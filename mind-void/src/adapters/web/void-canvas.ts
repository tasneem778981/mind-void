import type { LocalPoint, Surface, SurfaceLayers } from '../../core/ports';

/**
 * Sole web Surface implementation (AD-21).
 * Only this module calls getBoundingClientRect on the surface root (AD-6).
 */
export class VoidCanvas implements Surface {
  readonly layers: SurfaceLayers;

  private readonly root: HTMLElement;
  private readonly resizeObserver: ResizeObserver;
  private readonly onWindowInvalidate: () => void;
  private rect: DOMRectReadOnly | null = null;
  private disposed = false;

  constructor(host: HTMLElement) {
    this.root = host;
    host.classList.add('mv-void-canvas');

    const vignette = document.createElement('div');
    vignette.className = 'mv-layer mv-layer-vignette';
    vignette.setAttribute('aria-hidden', 'true');

    const shards = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    shards.classList.add('mv-layer', 'mv-layer-shards');
    // Not aria-hidden: shard bodies are the keyboard/AT focusables (AD-25).
    shards.style.touchAction = 'none';

    const fx = document.createElement('canvas');
    fx.className = 'mv-layer mv-layer-fx';
    fx.setAttribute('aria-hidden', 'true');
    fx.style.pointerEvents = 'none';

    const text = document.createElement('div');
    text.className = 'mv-layer mv-layer-text';
    text.style.pointerEvents = 'none';

    host.append(vignette, shards, fx, text);
    this.layers = { vignette, shards, fx, text };

    this.onWindowInvalidate = () => {
      this.invalidateClientRect();
    };

    this.resizeObserver = new ResizeObserver(() => {
      this.invalidateClientRect();
      this.syncFxCanvasSize();
    });
    this.resizeObserver.observe(host);

    window.addEventListener('scroll', this.onWindowInvalidate, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', this.onWindowInvalidate, {
      passive: true,
    });

    this.syncFxCanvasSize();
  }

  get width(): number {
    return this.readRect().width;
  }

  get height(): number {
    return this.readRect().height;
  }

  get dpr(): number {
    return typeof devicePixelRatio === 'number' && devicePixelRatio > 0
      ? devicePixelRatio
      : 1;
  }

  clientToLocal(clientX: number, clientY: number): LocalPoint {
    const rect = this.readRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  invalidateClientRect(): void {
    this.rect = null;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.resizeObserver.disconnect();
    window.removeEventListener('scroll', this.onWindowInvalidate, {
      capture: true,
    });
    window.removeEventListener('resize', this.onWindowInvalidate);
    this.layers.vignette.remove();
    this.layers.shards.remove();
    this.layers.fx.remove();
    this.layers.text.remove();
    this.root.classList.remove('mv-void-canvas');
    this.rect = null;
  }

  private readRect(): DOMRectReadOnly {
    if (!this.rect) {
      this.rect = this.root.getBoundingClientRect();
    }
    return this.rect;
  }

  private syncFxCanvasSize(): void {
    const rect = this.readRect();
    const dpr = this.dpr;
    const cssW = Math.max(1, Math.floor(rect.width));
    const cssH = Math.max(1, Math.floor(rect.height));
    const fx = this.layers.fx;
    fx.width = Math.max(1, Math.floor(cssW * dpr));
    fx.height = Math.max(1, Math.floor(cssH * dpr));
    fx.style.width = `${cssW}px`;
    fx.style.height = `${cssH}px`;
  }
}
