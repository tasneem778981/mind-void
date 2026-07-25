import type { MotionProfile } from '../../core/motion.generated';
import type { Surface } from '../../core/ports';
import type { DecisionNodeSnapshot } from '../../core/snapshot';
import {
  pointsToSvgPath,
  polylineToSvgPath,
  type ShardGeometryResult,
} from '../../core/shard-geometry';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * One-way snapshot → DOM (AD-2, AD-7).
 * Receives Surface — never imports VoidCanvas (AD-1 / AD-21).
 */
export class DomView {
  private readonly surface: Surface;
  private readonly svg: SVGSVGElement;

  constructor(surface: Surface) {
    this.surface = surface;
    this.svg = surface.layers.shards;
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
    }

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

      // Rim above body (AD-7)
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

  clear(): void {
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
  }
}
