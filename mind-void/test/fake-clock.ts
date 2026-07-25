import type { Clock, ClockHandle } from '../src/core/ports';

/** Deterministic Clock for core tests — no real timers (NFR5). */
export class FakeClock implements Clock {
  private time = 0;
  private nextId = 1;
  private alive = true;
  private readonly queue: Array<{
    id: number;
    due: number;
    callback: () => void;
  }> = [];

  now(): number {
    return this.time;
  }

  after(delayMs: number, callback: () => void): ClockHandle {
    if (!this.alive) return -1;
    const id = this.nextId++;
    this.queue.push({ id, due: this.time + delayMs, callback });
    return id;
  }

  cancel(handle: ClockHandle): void {
    const i = this.queue.findIndex((e) => e.id === handle);
    if (i >= 0) this.queue.splice(i, 1);
  }

  invalidate(): void {
    this.alive = false;
    this.queue.length = 0;
  }

  advance(ms: number): void {
    if (!this.alive) return;
    this.time += ms;
    const due = this.queue
      .filter((e) => e.due <= this.time)
      .sort((a, b) => a.due - b.due);
    for (const entry of due) {
      const i = this.queue.findIndex((e) => e.id === entry.id);
      if (i >= 0) this.queue.splice(i, 1);
      entry.callback();
    }
  }
}
