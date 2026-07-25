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
 * One-way snapshot → DOM (AD-2, AD-7, AD-10, AD-20, AD-25).
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
  private readonly onMouseDown: (event: MouseEvent) => void;
  private copyMounted = false;
  private cursorMounted = false;
  private mouseGuardAttached = false;
  private lastFocusedId: string | null = null;

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

    // Pointer must not steal keyboard focus (AD-8).
    this.onMouseDown = (event: MouseEvent) => {
      const t = event.target;
      if (!(t instanceof Element)) return;
      if (t.closest('[data-zone="body"]')) {
        event.preventDefault();
      }
    };
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
    this.svg.setAttribute('role', 'listbox');
    this.svg.setAttribute('aria-label', productCopy.decisionNodeLabel);

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

    if (snapshot.phase === 'solid') {
      this.renderSolidCharge(node, geometry);
      this.svg.append(node);
      this.svg.removeAttribute('role');
      return;
    }

    for (const shard of geometry.shards) {
      const group = document.createElementNS(SVG_NS, 'g');
      group.setAttribute('data-shard-id', shard.id);
      group.setAttribute('data-shard-index', String(shard.index));
      group.classList.add('mv-shard');
      if (snapshot.phase === 'committing') {
        group.dataset.committing = '1';
        group.style.setProperty('--mv-place-x', `${shard.placeX}px`);
        group.style.setProperty('--mv-place-y', `${shard.placeY}px`);
      } else if (snapshot.phase === 'redistributing') {
        group.style.transform = `translate(${shard.placeX}px, ${shard.placeY}px)`;
        group.style.transition = `transform var(--mv-profile-redistribute, var(--mv-motion-redistribute)) var(--mv-profile-ease-calm, var(--mv-motion-ease-calm))`;
      } else {
        group.style.transform = `translate(${shard.placeX}px, ${shard.placeY}px)`;
      }

      if (snapshot.eliminatingShardId === shard.id) {
        group.dataset.eliminating = '1';
        group.style.setProperty('--mv-base-x', `${shard.placeX}px`);
        group.style.setProperty('--mv-base-y', `${shard.placeY}px`);
        group.style.setProperty(
          '--mv-out-x',
          String(shard.outwardNormal.x * 36),
        );
        group.style.setProperty(
          '--mv-out-y',
          String(shard.outwardNormal.y * 36),
        );
      }

      if (
        snapshot.previewShardId === shard.id &&
        (snapshot.previewMode === 'solo' || snapshot.previewMode === 'mute') &&
        snapshot.phase !== 'pressing' &&
        snapshot.phase !== 'committing' &&
        snapshot.phase !== 'eliminating'
      ) {
        group.dataset.preview = snapshot.previewMode;
      }

      if (snapshot.pressedShardId === shard.id) {
        group.dataset.pressed = '1';
      }

      if (snapshot.focusedShardId === shard.id && snapshot.phase !== 'committing') {
        group.dataset.focused = '1';
      }

      const labels = productCopy.optionLabels ?? [];
      const label =
        labels[shard.index] ?? labels[labels.length - 1] ?? `Option ${shard.index + 1}`;

      const body = document.createElementNS(SVG_NS, 'path');
      body.setAttribute('d', pointsToSvgPath(shard.body));
      body.classList.add('mv-shard-body');
      body.setAttribute('data-shard-id', shard.id);
      body.setAttribute('data-zone', 'body');
      body.setAttribute('tabindex', snapshot.phase === 'committing' ? '-1' : '0');
      body.setAttribute('role', 'option');
      body.setAttribute('aria-label', label);
      body.setAttribute(
        'aria-selected',
        snapshot.focusedShardId === shard.id ? 'true' : 'false',
      );

      const rim = document.createElementNS(SVG_NS, 'path');
      rim.setAttribute('d', pointsToSvgPath(shard.rim));
      rim.classList.add('mv-shard-rim');
      rim.setAttribute('data-shard-id', shard.id);
      rim.setAttribute('data-zone', 'rim');
      rim.setAttribute('aria-hidden', 'true');
      rim.setAttribute('tabindex', '-1');

      group.append(body, rim);

      if (snapshot.pressedShardId === shard.id) {
        const progress = document.createElementNS(SVG_NS, 'path');
        progress.setAttribute('d', pointsToSvgPath(shard.body));
        progress.classList.add('mv-hold-progress');
        progress.setAttribute('aria-hidden', 'true');
        const len = polygonPerimeter(shard.body);
        progress.style.setProperty('--mv-hold-len', String(len));
        progress.style.strokeDasharray = String(len);
        progress.style.strokeDashoffset = String(len);
        group.append(progress);
        // Arm fill on next frame so CSS transition runs from full → 0.
        requestAnimationFrame(() => {
          progress.style.strokeDashoffset = '0';
        });
      }

      node.append(group);
    }

    const seams = document.createElementNS(SVG_NS, 'g');
    seams.classList.add('mv-seams');
    seams.setAttribute('aria-hidden', 'true');
    if (snapshot.phase === 'committing') {
      seams.dataset.flash = '1';
    }
    for (const seam of geometry.seams) {
      const path = document.createElementNS(SVG_NS, 'path');
      path.setAttribute('d', polylineToSvgPath(seam));
      path.classList.add('mv-seam');
      seams.append(path);
    }
    node.append(seams);

    this.svg.append(node);
    this.syncDomFocus(snapshot.focusedShardId);
  }

  private renderSolidCharge(
    node: SVGGElement,
    geometry: ShardGeometryResult,
  ): void {
    const { nodeCenter, nodeRadius } = geometry;
    const halo = document.createElementNS(SVG_NS, 'circle');
    halo.classList.add('mv-solid-halo');
    halo.setAttribute('cx', String(nodeCenter.x));
    halo.setAttribute('cy', String(nodeCenter.y));
    halo.setAttribute('r', String(nodeRadius + 8));
    halo.setAttribute('aria-hidden', 'true');

    const face = document.createElementNS(SVG_NS, 'circle');
    face.classList.add('mv-solid-charge');
    face.setAttribute('cx', String(nodeCenter.x));
    face.setAttribute('cy', String(nodeCenter.y));
    face.setAttribute('r', String(nodeRadius));
    face.setAttribute('role', 'img');
    face.setAttribute('aria-label', productCopy.thesis);

    node.append(halo, face);
  }

  setCursorVisible(visible: boolean): void {
    if (!visible) {
      this.cursorEl.dataset.cursor = 'hidden';
    }
  }

  clear(): void {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.hintEl.remove();
    this.thesisEl.remove();
    this.creditEl.remove();
    this.cursorEl.remove();
    this.svg.removeEventListener('mousedown', this.onMouseDown);
    this.copyMounted = false;
    this.cursorMounted = false;
    this.mouseGuardAttached = false;
    this.lastFocusedId = null;
  }

  private ensureChrome(root: HTMLElement | null): void {
    this.ensureCopy();
    if (!this.cursorMounted && root) {
      root.append(this.cursorEl);
      this.cursorMounted = true;
    }
    if (!this.mouseGuardAttached) {
      this.svg.addEventListener('mousedown', this.onMouseDown);
      this.mouseGuardAttached = true;
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
    this.hintEl.hidden = isSolid || phase === 'committing';
    this.thesisEl.hidden = !isSolid;
    this.creditEl.hidden = false;
    if (isSolid) {
      this.thesisEl.dataset.lifecycle = 'hold';
    } else {
      delete this.thesisEl.dataset.lifecycle;
    }
  }

  /** Apply DOM focus from FSM truth (AD-13 / AD-25). */
  private syncDomFocus(focusedShardId: string | null): void {
    if (!focusedShardId) {
      this.lastFocusedId = null;
      return;
    }
    const body = this.svg.querySelector(
      `[data-zone="body"][data-shard-id="${CSS.escape(focusedShardId)}"]`,
    );
    if (!(body instanceof SVGElement)) return;

    if (
      document.activeElement === body &&
      this.lastFocusedId === focusedShardId
    ) {
      return;
    }
    this.lastFocusedId = focusedShardId;
    body.focus({ preventScroll: true });
  }
}

function polygonPerimeter(
  points: readonly { x: number; y: number }[],
): number {
  if (points.length < 2) return 0;
  let len = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}
