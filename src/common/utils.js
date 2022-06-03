export function parseScalarAndUnit(item) {
  if (!item) return { value: 0, unit: null };
  if ((typeof item) === 'number') return { value: item, unit: null };
  const [, scalar, unit] = `${item}`.match(/^([\d.]+)([\w%]+)?$/);
  return { value: parseFloat(scalar || 0), unit: (unit || null) };
}

export function withUnitOrPreserve(item, unit, def) {
  let value = (item || def);
  if ((typeof value) === 'string') {
    const parsed = parseScalarAndUnit(item);
    if (parsed.unit == null) value = parsed.value;
  }
  return ((typeof value) === 'number') ? `${value}${unit}` : value;
}

export function copyPropertiesTo(item, source) {
  if (!(item instanceof Object) || !(source instanceof Object)) return;
  for (const [key, value] of Object.entries(source)) {
    // eslint-disable-next-line no-param-reassign
    item[key] = value;
  }
}

export function buildSectionPager(obj) {
  // eslint-disable-next-line no-param-reassign,no-proto
  obj.prototype = obj.__proto__;
  copyPropertiesTo(obj.prototype, {
    showSize: 10,
    sectionIndex() {
      return parseInt(`${this.page / this.showSize}`, 10);
    },
    sectionMax() {
      return (this.sectionIndex() + 1) * this.showSize - 1;
    },
    sectionMin() {
      return this.sectionMax() - (this.showSize - 1);
    },
    section() {
      const arr = [];
      for (let i = this.sectionMin(); i <= this.sectionMax(); i++) arr.push(i);
      return arr;
    },
  });

  return obj;
}

export function $delay(delay, mode) {
  function kickStart(that) {
    return setTimeout(() => {
      if (that.cancelLatch) {
        that.queue.clear();
        that.timeout = null;
        that.cancelLatch = false;
        return;
      }

      if (that.queue.isEmpty()) {
        that.timeout = null;
        return;
      }

      const [task] = that.queue.delete(0);
      task();
      that.timeout = kickStart(that);
    }, that.delay);
  }
  // noinspection JSValidateTypes
  return {
    timeout: null,
    delay,
    mode,
    /** @type {function()} */
    queue: [],
    cancelLatch: false,
    cancel() {
      this.cancelLatch = true;
    },
    do(action) {
      const that = this;
      switch (that.mode) {
        case 'queue':
          that.queue.push(action);
          if (that.timeout === null) that.timeout = kickStart(that);
          return true;
        case 'reject':
          if (this.queue.isNotEmpty()) return false;
          that.queue.push(action);
          if (!that.timeout) that.timeout = kickStart(that);
          return true;
        default:
          return false;
      }
    },
  };
}

export function $debounce(delay, mode) {
  return {
    timeout: null,
    mode,
    delay,
    nextTask: null,
    cancelLatch: false,
    do(action) {
      const that = this;
      if (that.timeout === null) {
        that.cancelLatch = false;
        this.timeout = setTimeout(() => {
          if (that.cancelLatch) {
            that.cancelLatch = false;
            return;
          }
          that.timeout = null;
          const { nextTask } = that;
          that.nextTask = null;
          if (nextTask) nextTask();
        }, that.delay);
        action();
        return true;
      }

      switch (that.mode) {
        case 'reject':
          return false;
        case 'delay':
          this.nextTask = action;
          return false;
        default:
          return false;
      }
    },
  };
}

export function extractUrlComponents(url) {
  if (!url) return null;
  const [match, protocol, server, location] = url.match(/^(https?):\/\/([\d.A-Za-z_\-@:]+)?\/?(.*)$/);
  if (!match) return null;
  return {
    protocol,
    server,
    location
  }
}
