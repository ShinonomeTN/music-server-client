/* eslint-disable no-extend-native */

function copyPropertiesTo(item, source) {
  if (!(item instanceof Object) || !(source instanceof Object)) return;
  for (const [key, value] of Object.entries(source)) {
    // eslint-disable-next-line no-param-reassign
    item[key] = value;
  }
}

export function entries(obj) {
  return Object.entries(obj);
}

export function filteringFields(obj, ...fields) {
  return entries(obj)
    .filter(([key]) => key in fields)
    .mapToMap(([key]) => key, ([, value]) => value);
}

copyPropertiesTo(Object.prototype, {
  filteringFields(...fields) {
    return filteringFields(this, fields);
  },
  entries() {
    return entries(this);
  },
});

copyPropertiesTo(Array.prototype, {
  mapToMap(keyProvider, valueProvider) {
    const obj = {};
    for (const item of this) obj[keyProvider(item)] = valueProvider(item);
    return obj;
  },
  mapNotNull(transformer) {
    const arr = [];
    for (const item of this) {
      const transformed = transformer(item);
      if (transformed !== null) arr.push(transformed);
    }
    return arr;
  },
  isEmpty() {
    return this.length === 0;
  },
  flatten() {
    return this.flatMap((item) => item);
  },
  groupBy(keyProvider) {
    const map = {};
    for (const item of this) {
      const key = keyProvider(item);
      if (!map[key]) map[key] = [];
      map[key].push(item);
    }
    return map;
  },
  /**
   * Distinct items
   * @return Array(*)
   */
  distinct() {
    const set = new Set();
    this.forEach((item) => set.add(item));
    return [...set];
  },
  /**
   * Distinct object by identity.
   * @param { (function(*): (string | number | boolean)) } identityProvider identity provider
   * @returns Array
   */
  distinctBy(identityProvider) {
    const map = {};
    this.forEach((item) => { map[identityProvider(item)] = item; });
    return Object.values(map);
  },
  onEach(action) {
    for (const i of this) action(i);
    return this;
  },
  isNotEmpty() {
    return !this.isEmpty();
  },
  /**
   * Associate values
   * @param { (function(*): string) } keyProvider key provider
   */
  associatedBy(keyProvider) {
    if (!(keyProvider instanceof Function)) throw Error('keyProvider should be a Function.');
    const map = {};
    this.forEach((i) => {
      map[keyProvider(i)] = i;
    });
    return map;
  },
  /**
   * Mapping, with index
   * @param { function(*, Number):* } converter
   */
  mapIndexed(converter) {
    const arr = [];
    for (let i = 0; i < this.length; i++) arr.push(converter(this[i], i));
    return arr;
  },
  clear() {
    const { length } = this;
    this.splice(0, length);
  },
  addAll(e) {
    e.forEach((i) => this.push(i));
  },
  /**
   * Delete element that match predicate
   * @param { function(*):Boolean } filter
   */
  deleteWhere(filter) {
    for (let i = 0; i < this.length; i++) if (filter(this[i])) return this.splice(i, 1);
    return [];
  },
  /**
   * Delete by index
   * @param { Number } index
   * @returns { Array } items deleted
   */
  delete(index) {
    return this.splice(index, 1);
  },
  all() {
    if (this.isEmpty()) return false;
    for (const item of this) if (!item) return false;
    return true;
  },
  /**
   * Check if all item matches predicate
   * @param { function(*):boolean } predicate
   * @returns {boolean}
   */
  allMatch(predicate) {
    if (this.isEmpty()) return false;
    for (const item of this) if (!predicate(item)) return false;
    return true;
  },
  any() {
    if (this.isEmpty()) return false;
    for (const item of this) if (item) return true;
    return false;
  },
  max(numberProvider) {
    let max = this[0];
    for (const element of this) if (numberProvider(element) > numberProvider(max)) max = element;
    return max;
  },
  /**
   * Check if any item match perdicate
   * @param { function(*):boolean } predicate
   * @returns {boolean}
   */
  anyMatch(predicate) {
    if (this.isEmpty()) return false;
    for (const item of this) if (predicate(item)) return true;
    return false;
  },
  drop(amount) {
    const newArray = [];
    let index = 0;
    const { length } = this;
    do {
      if (index >= amount) newArray.push(this[index]);
      index++;
    } while (index < length);
    return newArray;
  },
  take(amount) {
    const newArray = [];
    let index = 0;
    const { length } = this;
    do {
      newArray.push(this[index]);
      index++;
    } while (index < length && index < amount);
    return newArray;
  },
  first() {
    if (this.isEmpty()) return null;
    const [first] = this;
    return first;
  },
  firstMatch(predicate) {
    for (const i of this) if (predicate(i)) return i;
    return null;
  },
  last() {
    if (this.isEmpty()) return null;
    return this[this.length - 1];
  },
});
