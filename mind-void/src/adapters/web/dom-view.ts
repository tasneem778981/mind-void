import { productCopy } from '../../core/copy.generated';
import type { MotionProfile } from '../../core/motion.generated';
import type { Surface } from '../../core/ports';
import type { DecisionNodeSnapshot } from '../../core/snapshot';
import {
  pointsToSvgPath,
  polylineToSvgPath,
  type ShardGeometryResult,
} from '../../core/shard-geometry';

const SVG_NS = 'http://www.w3.org/2000/svg';

export type CursorMode = 'idle' | 'attract' | 'repulse' | 'hidden';

/**
 * One-way snapshot → DOM (AD-2, AD-7, AD-10, AD-20).
 * Cursor **mode** owned here; cursor **position** owned by PointerAdapter.
 */
export class DomView {
  private readonly surface: Surface;
  private readonly svg: SVGSVGElement;
  private readonly textLayer: HTMLElement;
  private readonly hintEl: HTMLParagraphElement;
  private readonly thesisEl: HTMLParagraphElement;
  private readonly creditEl: HTMLParagraphElement;
  private readonly cursorEl: HTMLDivElement;
  private copyMounted = false;
  private cursorMounted = false;

  constructor(surface: Surface) {
    this.surface = surface;
    this.svg = surface.layers.shards;
    this.textLayer = surface.layers.text;

    this.hintEl = document.createElement('p');
    this.hintEl.className = 'mv-copy mv-copy-hint';
    this.hintEl.dataset.copy = 'hint';

    this.thesisEl = document.createElement('p');
    this.thesisEl.className = 'mv-copy mv-copy-thesis';
    this.thesisEl.dataset.copy = 'thesis';
    this.thesisEl.hidden = true;

    this.creditEl = document.createElement('p');
    this.creditEl.className = 'mv-copy mv-copy-credit';
    this.creditEl.dataset.copy = 'architecture-credit';

    this.cursorEl = document.createElement('div');
    this.cursorEl.className = 'mv-cursor';
    this.cursorEl.dataset.cursor = 'idle';
    this.cursorEl.setAttribute('aria-hidden', 'true');
    this.cursorEl.innerHTML = `
      <span class="mv-cursor-ring"></span>
      <span class="mv-cursor-dot"></span>
      <span class="mv-cursor-tick mv-cursor-tick-n"></span>
      <span class="mv-cursor-tick mv-cursor-tick-e"></span>
      <span class="mv-cursor-tick mv-cursor-tick-s"></span>
      <span class="mv-cursor-tick mv-cursor-tick-w"></span>
    `;
  }

  /** PointerAdapter writes transform here only (AD-10). */
  get cursorElement(): HTMLElement {
    return this.cursorEl;
  }

  render(
    snapshot: DecisionNodeSnapshot,
    geometry: ShardGeometryResult,
    motion: MotionProfile,
  ): void {
    const { width, height } = this.surface;
    this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.svg.setAttribute('width', String(width));
    this.svg.setAttribute('height', String(height));

    const root = this.surface.layers.vignette.parentElement;
    if (root) {
      root.dataset.phase = snapshot.phase;
      root.dataset.idlePulse = motion.idlePulse ? '1' : '0';
      root.dataset.previewMode = snapshot.previewMode;
      root.style.cursor = 'none';
    }

    this.ensureChrome(root);
    this.syncCursorMode(snapshot.previewMode);
    this.syncCopyForPhase(snapshot.phase);

    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }

    const node = document.createElementNS(SVG_NS, 'g');
    node.setAttribute('data-decision-node', 'node-1');
    node.classList.add('mv-decision-node');

    for (const shard of geometry.shards) {
      const group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('data-shard-id', shard.id);
      group.setAttribute('data-shard-index', String(shard.index));
      group.classList.add('mv-shard');
      group.style.transform = `translate(${shard.placeX}px, ${shard.placeY}px)`;

      if (
        snapshot.previewShardId === shard.id &&
        (snapshot.previewMode === 'solo' || snapshot.previewMode === 'mute')
      ) {
        group.dataset.preview = snapshot.previewMode;
      }

      const body = document.createElementNS(SVG_NS, 'path');
      body.setAttribute('d', pointsToSvgPath(shard.body));
      body.classList.add('mv-shard-body');
      body.setAttribute('data-shard-id', shard.id);
      body.setAttribute('data-zone', 'body');
      body.setAttribute('tabindex', '-1');
      body.setAttribute('role', 'presentation');

      const rim = document.createElementNS(SVG_NS, 'path');
      rim.setAttribute('d', pointsToSvgPath(shard.rim));
      rim.classList.add('mv-shard-rim');
      rim.setAttribute('data-shard-id', shard.id);
      rim.setAttribute('data-zone', 'rim');
      rim.setAttribute('aria-hidden', 'true');

      group.append(body, rim);
      node.append(group);
    }

    const seams = document.createElementNS(SVG_NS, 'g');
    seams.classList.add('mv-seams');
    seams.setAttribute('aria-hidden', 'true');
    for (const seam of geometry.seams) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', polylineToSvgPath(seam));
      path.classList.add('mv-seam');
      seams.append(path);
    }
    node.append(seams);

    this.svg.append(node);
  }

  setCursorVisible(visible: boolean): void {
    if (!visible) {
      this.cursorEl.dataset.cursor = 'hidden';
      return;
    }
    // Visibility restored on next render mode sync / pointer move path.
  }

  clear(): void {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.hintEl.remove();
    this.thesisEl.remove();
    this.creditEl.remove();
    this.cursorEl.remove();
    this.copyMounted = false;
    this.cursorMounted = false;
  }

  private ensureChrome(root: HTMLElement | null): void {
    this.ensureCopy();
    if (!this.cursorMounted && root) {
      root.append(this.cursorEl);
      this.cursorMounted = true;
    }
  }

  private ensureCopy(): void {
    if (this.copyMounted) return;

    this.hintEl.textContent = productCopy.hint;
    this.thesisEl.textContent = productCopy.thesis;
    this.creditEl.textContent = productCopy.architectureCredit;

    this.textLayer.append(this.hintEl, this.thesisEl, this.creditEl);
    this.copyMounted = true;
  }

  private syncCursorMode(previewMode: DecisionNodeSnapshot['previewMode']): void {
    if (this.cursorEl.dataset.cursor === 'hidden') return;
    const mode: CursorMode =
      previewMode === 'solo'
        ? 'attract'
        : previewMode === 'mute'
          ? 'repulse'
          : 'idle';
    this.cursorEl.dataset.cursor = mode;
  }

  private syncCopyForPhase(phase: DecisionNodeSnapshot['phase']): void {
    const isSolid = phase === 'solid';
    this.hintEl.hidden = isSolid;
    this.thesisEl.hidden = !isSolid;
    this.creditEl.hidden = false;
  }
}
