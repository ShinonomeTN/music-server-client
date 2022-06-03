<template>
  <transition name="ani-fade-keep-position">
    <div class="view-fixed" style="display: flex;;" v-if="show" :style="{zIndex: zIndex}">
      <div class="ms-backdrop" style="flex-grow: 1" :class="classes"  @click="onBackdropClick"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MSBackdrop',
  props: {
    show: Boolean,
    mode: {
      type: String,
      default: 'dark',
    },
    zIndex: {
      type: [Number, String],
      default: 500,
    },
  },
  emits: ['click'],
  methods: {
    onBackdropClick() {
      if (!this.show) return;
      this.$emit('click');
    },
  },
  computed: {
    classes() {
      const classes = {};
      const styleClass = `style-${this.mode}`;
      classes[styleClass] = true;
      return classes;
    },
  },
};
</script>

<style>

.ms-backdrop.hidden {
  background-color: transparent!important;
  transition: all 0.3s;
}

.ms-backdrop {
  z-index: v-bind(zIndex);
  transition: all 0.3s;
}

.ms-backdrop.style-dark {
  background-color: #00000088;
}

.ms-backdrop.style-dark-glass {
  backdrop-filter: blur(2pt);
  background-color: #0008;
}

.ms-backdrop.style-light-glass {
  backdrop-filter: blur(2pt);
  background-color: #DDD8;
}

.ms-backdrop.style-glass {
  backdrop-filter: blur(2pt);
}

.ms-backdrop.style-clear {
  background-color: transparent;
}

</style>
