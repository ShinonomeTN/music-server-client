export function withUnitOrPreserve(item, unit, def) {
  const value = (item || def);
  return (value instanceof Number) ? `${value}${unit}` : value;
}

export function parseScalarAndUnit(item) {
  if (!item) return null;
  if (item instanceof Number) return { value: item, unit: null };
  const [, scalar, unit] = item.match(/^([\d.]+)(\w+)?$/);
  return { value: (scalar || 0), unit: (unit || null) };
}

export function copyPropertiesTo(item, source) {
  if (!(item instanceof Object) || !(source instanceof Object)) return;
  for (const [key, value] of Object.entries(source)) {
    // eslint-disable-next-line no-param-reassign
    item[key] = value;
  }
}
