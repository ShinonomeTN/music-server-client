<template>
  <div>
    <transition name="ani-fade-keep-position">
      <div class="view-fixed backdrop-visible"
           style="display: flex; align-items: center; justify-content: center;"
           v-if="isModalShow" @click="onBackdropClick"
      >
      </div>
    </transition>
    <transition name="ani-zoom-keep-position" @after-enter="isModalBodyVisible = true" @before-leave="isModalBodyVisible = false">
      <div class="view-fixed" style="display: flex; justify-content: center; align-items: center; pointer-events: none"
           v-if="isModalShow">
        <div class="modal-content" :style="[{'width' : width}]">
          <div class="modal-header">
            <slot name="header">
              <h5 class="modal-title">{{ header }}</h5>
              <button v-if="showCloseButton" type="button" class="btn-close" @click="onCloseButtonClick" aria-label="Close"></button>
            </slot>
          </div>
          <div class="modal-body"
               :class="[{'height-max': isModalBodyVisible}]"
               style="overflow: hidden; padding: 0;"
          >
            <transition name="ani-fade">
              <slot name="content">
                <div style="padding: 1rem">{{ content }}</div>
              </slot>
            </transition>
          </div>
          <div class="modal-footer">
            <slot name="footer">
              <button type="button" class="btn btn-secondary" @click="onConfirmButtonClick">Yes</button>
              <button type="button" class="btn btn-primary" @click="onCancelButtonClick">No</button>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      type: String,
      default: null,
    },
    showCloseButton: {
      type: Boolean,
      default: true,
    },
    content: {
      type: String,
      default: null,
    },
    isModalShow: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: '50%',
    }
  },
  data() {
    return {
      isModalBodyVisible: false,
    };
  },
  methods: {
    showModalBody() {
      this.isModalBodyVisible = true;
    },
    onCloseButtonClick() {
      this.$emit('close');
    },
    onConfirmButtonClick() {
      this.$emit('confirm');
    },
    onCancelButtonClick() {
      this.$emit('cancel');
    },
    onBackdropClick() {
      this.$emit('backdrop_click');
    },
  },
  name: 'MSModalBase',
};
</script>

<style scoped>
.modal-body {
  max-height: 0;
  transition: max-height 0.5s;
  box-shadow: inset 0 0 3pt 3pt whitesmoke;
}

/*noinspection CssUnresolvedCustomProperty*/
.height-max {
  max-height: var(--window-height, 500px);
  transition: max-height 0.5s;
}

.backdrop-invisible {
  pointer-events: none;
  background-color: transparent;
}

.backdrop-visible {
  background-color: #00000088;
}

.all-transition * {
  transition: all 0.3s ease-in-out;
}
</style>
