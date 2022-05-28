<template>
  <transition name="ani-fade-keep-position">
    <div class="view-fixed backdrop" :class="{ 'visually-hidden': !hasBackdrop }"
         v-if="isModalShow" @click="onBackdropClick"></div>
  </transition>
  <transition name="ani-zoom-keep-position" @after-enter="isModalBodyVisible = true" @before-leave="isModalBodyVisible = false">
    <div class="view-fixed modal-container" v-if="isModalShow">
      <div class="modal-content" :style="modalContentStyle">
        <div class="modal-header">
          <slot name="header">
            <h5 class="modal-title">{{ header }}</h5>
            <button v-if="showCloseButton" type="button" class="btn-close" @click="onCloseButtonClick" aria-label="Close"></button>
          </slot>
        </div>
        <div class="modal-body" :class="{'height-max': isModalBodyVisible, 'height': modalContentHeight, 'collapsable' : !isFullScreen}"
             style="overflow: hidden; padding: 0;"
        >
          <transition name="ani-fade">
            <slot>
              <div style="padding: 1rem">{{ content }}</div>
            </slot>
          </transition>
        </div>
        <div class="modal-footer" v-if="showFooter">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" @click="onConfirmButtonClick">Yes</button>
            <button type="button" class="btn btn-primary" @click="onCancelButtonClick">No</button>
          </slot>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { withUnitOrPreserve } from '@/common/utils';

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
    width: [Number, String],
    contentHeight: [Number, String],
    showFooter: {
      type: Boolean,
      default: true,
    },
    collapsed: {
      type: Boolean,
      default: true,
    },
    backdrop: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      default: 'modal',
    },
  },
  data() {
    return {
      isModalBodyVisible: !this.collapsed || this.isFullScreen,
    };
  },
  emits: ['close', 'confirm', 'cancel', 'backdrop_click'],
  methods: {
    showModalBody() {
      if (this.isFullScreen) return;
      this.isModalBodyVisible = true;
    },
    hideModalBody() {
      if (this.isFullScreen) return;
      this.isModalBodyVisible = false;
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
  computed: {
    modalContentStyle() {
      if (this.isFullScreen) {
        return {
          position: 'absolute',
          left: '5pt',
          top: '5pt',
          right: '5pt',
          bottom: '5pt',
        };
      }
      return {
        width: this.modalWidth,
      };
    },
    modalContentHeight() {
      return withUnitOrPreserve(this.contentHeight, 'px', 'unset');
    },
    isFullScreen() {
      return this.type === 'full-screen';
    },
    hasBackdrop() {
      return this.backdrop;
    },
    modalWidth() {
      return withUnitOrPreserve(this.width, 'px', '50%');
    },
  },
  name: 'MSModalBase',
};
</script>

<style scoped>

.modal-body.collapsable {
  transition: max-height 0.5s;
}

.modal-body {
  max-height: 0;
  box-shadow: inset 0 0 3pt 3pt whitesmoke;
}

.modal-content {
  width: unset;
}

/*noinspection CssUnresolvedCustomProperty*/
.height-max.collapsable {
  transition: max-height 0.5s;
}
.height-max {
  max-height: var(--window-height, 500px);
}

.backdrop {
  background-color: #00000088;
}

.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}

.all-transition * {
  transition: all 0.3s ease-in-out;
}
</style>
