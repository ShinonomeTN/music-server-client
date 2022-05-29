/* eslint-disable no-extend-native */

function copyPropertiesTo(item, source) {
  if (!(item instanceof Object) || !(source instanceof Object)) return;
  for (const [key, value] of Object.entries(source)) {
    // eslint-disable-next-line no-param-reassign
    item[key] = value;
  }
}

copyPropertiesTo(Array.prototype, {
  isEmpty() {
    return this.length === 0;
  },
  isNotEmpty() {
    return !this.isEmpty();
  },
  associatedBy(keyProvider) {
    if (!(keyProvider instanceof Function)) throw Error('keyProvider should be a Function.');
    const map = {};
    this.forEach((i) => {
      map[keyProvider(i)] = i;
    });
    return map;
  },
  clear() {
    const { length } = this;
    this.splice(0, length);
  },
  addAll(e) {
    e.forEach((i) => this.push(i));
  },
  deleteWhere(filter) {
    for (let i = 0; i < this.length; i++) if (filter(this[i])) return this.splice(i, 1);
    return [];
  },
  delete(index) {
    return this.splice(index, 1)
  },
  all() {
    if (this.isEmpty()) return false;
    for (const item of this) if (item) return true;
    return false;
  },
  any() {
    if (this.isEmpty()) return false;
    for (const item of this) if (item) return true;
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
  last() {
    if (this.isEmpty()) return null;
    return this[this.length - 1];
  },
});
