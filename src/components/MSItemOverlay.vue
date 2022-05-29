<template>
<div class="ms-item-overlay" :style="{borderRadius: theBorderRadius}">
  <slot></slot>
  <div class="overlay-active view-absolute" style="pointer-events: none"
       :style="{'background-color' : activeBackgroundColor || 'transparent' }"
  >
    <slot name="overlay-active"></slot>
  </div>
  <div class="overlay view-absolute"
       :class="{'fade-on-hover': fadeOnHover}"
       @click="$emit('click')"
  >
    <slot name="overlay-item" class="view-absolute overlay-item"></slot>
  </div>
</div>
</template>

<script>
import { withUnitOrPreserve } from '@/common/utils';

export default {
  name: 'MSItemOverlay',
  emits: ['click'],
  props: {
    fadeOnHover: Boolean,
    overlayColor: String,
    borderOnHover: Boolean,
    borderRadius: [String, Number],
    activeBorderColor: [String],
    activeBorderWidth: [String, Number],
    activeBackgroundColor: [String],
  },
  computed: {
    theOverlayColor() {
      return this.overlayColor || '#8888';
    },
    theBorderRadius() {
      return withUnitOrPreserve(this.borderRadius, 'px', '5px');
    },
    theActiveBorderColor() {
      return this.activeBorderColor || 'orange';
    },
    theActiveBorderWidth() {
      return withUnitOrPreserve(this.activeBorderWidth, 'px', 2);
    },
  },
};
</script>

<style>
.ms-item-overlay {
  position: relative;
}

.ms-item-overlay > .overlay {
  transition: all 0.2s;
  overflow: hidden;
  border-radius: v-bind(theBorderRadius);
}

.ms-item-overlay > .overlay {
  display: none;
  justify-content: center;
  align-items: center;
}

.ms-item-overlay:hover > .overlay {
  display: flex;
}

.ms-item-overlay > .overlay.fade-on-hover:hover {
  transition: all 0.2s;
  background-color: v-bind(theOverlayColor);
}

.ms-item-overlay > .overlay-active {
  display: none;
  justify-content: center;
  align-items: center;
}

.ms-item-overlay.active > .overlay-active {
  display: flex;
  border: v-bind(theActiveBorderColor) solid v-bind(theActiveBorderWidth);
  border-radius: v-bind(theBorderRadius);
}

.ms-item-overlay > .overlay.fade-on-hover {
  transition: all 0.2s;
}
</style>
