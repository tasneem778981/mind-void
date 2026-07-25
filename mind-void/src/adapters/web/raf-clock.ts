import type { Clock, ClockHandle } from '../../core/ports';

/**
 * Browser Clock stub (AD-5). Real rAF ownership stays with ParticleEngine later;
 * timed FSM phases use setTimeout via this adapter-only clock.
 */
export class TimeoutClock implements Clock {
  private nextId = 1;
  private alive = true;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  now(): number {
    return performance.now();
  }

  after(delayMs: number, callback: () => void): ClockHandle {
    if (!this.alive) return -1;
    const id = this.nextId++;
    const handle = setTimeout(() => {
      this.timers.delete(id);
      if (this.alive) callback();
    }, delayMs);
    this.timers.set(id, handle);
    return id;
  }

  cancel(handle: ClockHandle): void {
    const t = this.timers.get(handle);
    if (t !== undefined) {
      clearTimeout(t);
      this.timers.delete(handle);
    }
  }

  invalidate(): void {
    this.alive = false;
    for (const t of this.timers.values()) clearTimeout(t);
    this.timers.clear();
  }
}
