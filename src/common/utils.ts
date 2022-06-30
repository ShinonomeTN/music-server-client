import { Optional } from '@/common/foolish';

export function parseScalarAndUnit(item : Optional<string> | Optional<number>) : { value: number, unit: Optional<string> } {
  if (!item) return { value: 0, unit: null };
  if ((typeof item) === 'number') return { value: parseFloat(String(item || 0)), unit: null };

  // @ts-ignore
  const [, scalar, unit] = `${item}`.match(/^([\d.]+)([\w%]+)?$/);

  return { value: parseFloat(scalar || 0), unit: (unit || null) };
}

export function withUnitOrPreserve(
  item : Optional<string> | Optional<number>, unit : Optional<string>,
  def : Optional<string> | Optional<number>,
) : string {
  let value = (item || def);
  if ((typeof value) === 'string') {
    const parsed = parseScalarAndUnit(item);
    if (parsed.unit == null) value = parsed.value;
  }
  return ((typeof value) === 'number') ? `${value}${unit}` : String(value);
}

export function copyPropertiesTo(item : unknown, source : unknown) {
  if (!(item instanceof Object) || !(source instanceof Object)) return;
  // @ts-ignore
  for (const [key, value] of Object.entries(source)) {
    // @ts-ignore
    item[key] = value;
  }
}

export class SectionPager {
  showSize = 10
  page = 0

  get sectionIndex() : number {
    return parseInt(`${this.page / this.showSize}`, 10);
  }

  get sectionMax() : number {
    return (this.sectionIndex + 1) * this.showSize - 1;
  }

  get sectionMin() : number {
    return this.sectionMax - (this.showSize - 1);
  }

  get section() : number[] {
    const arr = [];
    for (let i = this.sectionMax; i <= this.sectionMax; i++) arr.push(i);
    return arr;
  }
}

export class Delay {
  delay : number
  mode: 'enqueue' | 'reject'
  private queue : Array<() => void> = []
  private cancelLatch = false
  private timeout: unknown | null = null

  constructor(delay: number, mode: 'enqueue' | 'reject') {
    this.delay = delay;
    this.mode = mode;
  }

  private kickStart() {
    return setTimeout(() => {
      if (this.cancelLatch) {
        this.queue.clear();
        this.timeout = null;
        this.cancelLatch = false;
      }

      if (this.queue.isEmpty()) {
        this.timeout = null;
      }

      const [task] = this.queue.delete(0);
      task();
      this.timeout = this.kickStart();
    }, this.delay);
  }

  cancel() : void {
    this.cancelLatch = true;
  }

  do(action: () => void) {
    const { queue, timeout } = this;
    switch (this.mode) {
      case 'enqueue':
        queue.push(action);
        if (timeout === null) this.timeout = this.kickStart();
        return true;
      case 'reject':
        if (queue.isNotEmpty()) return false;
        queue.push(action);
        if (!timeout) this.timeout = this.kickStart();
        return true;
      default:
        return false;
    }
  }
}

export class Debounce {
  delay: number
  mode : 'delay' | 'reject'

  private timeout : unknown | null = null
  private nextTask : (() => void) | null = null
  private cancelLatch = false

  constructor(delay: number, mode: 'delay' | 'reject' = 'delay') {
    this.delay = delay;
    this.mode = mode;
  }

  do(action: () => void) : boolean {
    const { timeout, cancelLatch, delay } = this;
    if (timeout == null) {
      this.cancelLatch = false;
      this.timeout = setTimeout(() => {
        if (cancelLatch) {
          this.cancelLatch = false;
          return;
        }

        this.timeout = null;
        const { nextTask } = this;
        this.nextTask = null;
        if (nextTask) nextTask();
      }, delay);
      action();
      return true;
    }

    switch (this.mode) {
      case 'reject':
        return false;
      case 'delay':
        this.nextTask = action;
        return true;
      default:
        return false;
    }
  }
}

export type UrlComponentExtractResult = { protocol: Optional<string>, server: Optional<string>, location: Optional<string> }

export function extractUrlComponents(url : string) : Optional<UrlComponentExtractResult> {
  if (!url) return null;
  const [match, protocol, server, location] = url.match(/^(https?):\/\/([\d.A-Za-z_\-@:]+)?\/?(.*)$/);
  if (!match) return null;
  return {
    protocol,
    server,
    location,
  };
}
