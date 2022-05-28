<template>
<div class="ms-card ms-button-card" :style="styles" @click="$emit('click')">
  <div class="ms-button-card-overlay"></div>
  <div class="ms-button-card-icon">
    <slot name="icon">
      <div class="p-3" style="color: darkgray"><i class="bi-plus-lg" :style="iconStyle" /></div>
    </slot>
  </div>
  <div class="ms-button-card-text">{{text}}</div>
</div>
</template>

<script>
import { parseScalarAndUnit, withUnitOrPreserve } from '@/common/utils';

export default {
  name: 'ButtonCard',
  emits: ['click'],
  props: {
    size: [Number, String],
    icon: [String],
    text: [String],
  },
  computed: {
    styles() {
      const size = {
        width: withUnitOrPreserve(this.size, 'px', '100px'),
        height: withUnitOrPreserve(this.size, 'px', '100px'),
      };
      return {
        ...size,
        minWidth: size.width,
        minHeight: size.height,
      };
    },
    iconStyle() {
      return {
        fontSize: (() => {
          const item = parseScalarAndUnit(withUnitOrPreserve(this.size, 'px', '24px'));
          return `${item.value / 2}${item.unit || 'px'}`;
        })(),
      };
    },
  },
};
</script>

<style>
.ms-button-card {
  position: relative;
  text-align: center;
}
.ms-button-card-icon {
  display: flex;
  justify-content: center;
  align-items: center;
}
.ms-button-card-overlay {
  position: absolute;
  width: inherit;
  height: inherit;
  transition: background-color 0.3s;
}
.ms-button-card-text {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px 5px
}
.ms-button-card:hover .ms-button-card-overlay {
  background-color: #dddddd77;
  transition: background-color 0.3s;
}
</style>
