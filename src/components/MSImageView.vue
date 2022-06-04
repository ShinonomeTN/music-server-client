<template>
<div class="ms-image-view" :class="classes" :style="styles" @click="$emit('click')">
  <slot v-if="stage === 'show-loading'" name="preload-image">
    <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
      <svg :width="defaultIconSize" :height="defaultIconSize" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2h-7zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48V8.35zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
      </svg>
    </div>
  </slot>
  <slot v-if="stage === 'show-error'" name="error-image">
    <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
      <svg :width="defaultIconSize" :height="defaultIconSize" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
      </svg>
    </div>
  </slot>
  <slot v-if="stage === 'show-no-image'" name="empty-image">
    <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
      <svg :width="defaultIconSize" :height="defaultIconSize" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
        <path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2V3zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0z"/>
      </svg>
    </div>
  </slot>
  <div :class="{'visually-hidden' : stage !== 'show-img'}"
       style="display: flex; justify-content: center; align-items: center; width: inherit; height: inherit"
  >
    <img
         :loading="lazy ? 'lazy' : 'eager'"
         ref="image"
         src=""
         alt="Image"
         :style="imageStyles"
    />
  </div>
</div>
</template>

<script>
import { parseScalarAndUnit } from '@/common/utils';

function stringOrDefault(item, def) {
  if (!item) return def;
  if (item instanceof Number) return `${item}px`;
  return item;
}

export default {
  props: {
    width: [Number, String],
    height: [Number, String],
    rounded: Boolean,
    color: String,
    backgroundColor: String,
    src: String,
    fit: String,
    lazy: Boolean,
    borderRadius: String,
  },
  name: 'MSImageView',
  data() {
    return {
      showPreloadImage: true,
      /** @type {'show-img', 'show-loading', 'show-error', 'show-no-image'} */
      stage: 'show-img',
    };
  },
  mounted() {
    this.initImage();
  },
  methods: {
    initImage() {
      this.stage = 'show-loading';
      const { src } = this;
      if (!src) {
        this.stage = 'show-no-image';
        return;
      }

      const { image } = this.$refs;
      if (!image) return;
      image.onload = this.onImageLoaded;
      image.onerror = this.onImageError;
      image.src = src;
    },
    onImageLoaded() {
      this.stage = 'show-img';
    },
    onImageError() {
      this.stage = 'show-error';
    },
  },
  computed: {
    styles() {
      return {
        color: this.color || 'lightgray',
        backgroundColor: this.backgroundColor || 'gray',
        width: stringOrDefault(this.width, '24px'),
        height: stringOrDefault(this.height, '24px'),
        minWidth: stringOrDefault(this.width, '24px'),
        minHeight: stringOrDefault(this.height, '24px'),
        'border-radius': `${this.rounded ? '50%' : stringOrDefault(this.borderRadius, '0')}!important`,
      };
    },
    imageStyles() {
      return {
        width: '100%',
        height: '100%',
        'object-fit': this.fit || 'cover',
      };
    },
    classes() {
      const classes = {};
      switch (this.stage) {
        case 'show-img':
          classes.present = true;
          break;
        case 'show-error':
          classes.error = true;
          break;
        case 'show-loading':
          classes.loading = true;
          break;
        case 'show-no-image':
          classes.empty = true;
          break;
        default:
          break;
      }
      return classes;
    },
    defaultIconSize() {
      return (parseScalarAndUnit(this.width).value || 48) / 2;
    },
  },
  watch: {
    src: {
      handler() {
        this.initImage();
      },
      immediate: true,
    },
    /** @param {'show-img', 'show-loading', 'show-error', 'show-no-image'} newValue */
    stage: {
      handler(newValue) {
        switch (newValue) {
          case 'show-img':
            this.$emit('loaded');
            break;
          case 'show-loading':
            this.$emit('loading');
            break;
          case 'show-no-image':
            this.$emit('clear');
            break;
          case 'show-error':
            this.$emit('error');
            break;
          default:
            break;
        }
      },
      immediate: true,
    },
  },
  emits: ['loaded', 'loading', 'clear', 'error', 'click'],
  beforeUnmount() {
    this.$refs.image.onload = null;
    this.$refs.image.onerror = null;
  },
};
</script>

<style>
.ms-image-view {
  position: relative;
  overflow: hidden;
}

.ms-image-view.rounded img {
  border-radius: inherit;
}
</style>
