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
