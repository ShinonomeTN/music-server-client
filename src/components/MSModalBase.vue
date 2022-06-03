<template>
  <div class="ms-modal-base" :class="{'fullscreen' : isFullScreen}">
    <ms-backdrop z-index="950" :show="isModalShow" :mode="backdrop" />
    <transition name="ani-zoom-keep-position" @after-enter="isModalBodyVisible = true" @before-leave="isModalBodyVisible = false">
      <div class="view-fixed modal-container" v-if="isModalShow">
        <div class="modal-content ms-modal-base_content" :style="{minWidth: modalWidth}">
          <div class="modal-header">
            <slot name="header">
              <h5 class="modal-title">{{ header }}</h5>
              <button v-if="showCloseButton" type="button" class="btn-close" @click="onCloseButtonClick" aria-label="Close"></button>
            </slot>
          </div>
          <div class="modal-body"
               :class="{'height': modalContentHeight, 'collapsable' : !isFullScreen, 'height-max': isModalBodyVisible}"
               @transitioncancel="onBodyTransitionEnd"
               @transitionend="onBodyTransitionEnd"
               style="overflow: hidden; padding: 0;"
          >
            <transition name="ani-fade">
              <slot>
                <div style="padding: 1rem" v-html="content"></div>
              </slot>
            </transition>
          </div>
          <div class="modal-footer" v-if="showFooter">
            <slot name="footer">
              <!--     SAO Style YES-NO       -->
              <template v-if="footerType === 'sao-yes-no'">
                <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-secondary"
                        @click="onCancelButtonClick"
                >
                  <i class="bi-x-lg"/>
                  <span style="flex-grow: 1;">{{ cancelText || 'NO' }}</span>
                </button>
                <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-danger"
                        @click="onConfirmButtonClick"
                >
                  <i class="bi-circle"/>
                  <span style="flex-grow: 1">{{ confirmText || 'YES' }}</span>
                </button>
              </template>

              <template v-else-if="footerType === 'sao-yes'">
                <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-danger"
                        @click="onConfirmButtonClick"
                >
                  <i class="bi-circle"/>
                  <span style="flex-grow: 1">{{ confirmText || 'YES' }}</span>
                </button>
              </template>

              <!--     Simple CONFIRM-CANCEL   -->
              <template v-else-if="footerType === 'confirm-cancel'">
                <button type="button" class="btn btn-primary"
                        @click="onConfirmButtonClick" style="width: 100pt"
                >{{ confirmText || 'CONFIRM' }}</button>
                <button type="button" class="btn btn-secondary" @click="onCancelButtonClick"
                        style="width: 100pt"
                >{{ cancelText || 'CANCEL' }}</button>
              </template>
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import MSBackdrop from '@/components/MSBackdrop.vue';
import { withUnitOrPreserve } from '@/common/utils';

export default {
  components: {
    'ms-backdrop': MSBackdrop,
  },
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
      type: String,
      default: 'dark-glass',
    },
    type: {
      type: String,
      default: 'modal',
    },
    footerType: {
      type: String,
      default: 'confirm-cancel',
    },
    confirmText: {
      type: String,
      default: 'CONFIRM',
    },
    cancelText: {
      type: String,
      default: 'CANCEL',
    },
  },
  data() {
    return {
      isModalBodyVisible: !this.collapsed || this.type === 'full-screen',
      isAnimating: false,
      doOnBodyTransitionEnd: () => {},
    };
  },
  emits: ['close', 'confirm', 'cancel', 'backdrop_click'],
  methods: {
    onBodyTransitionEnd() {
      this.doOnBodyTransitionEnd();
    },
    showModalBody() {
      if (this.isFullScreen || this.isAnimating) return Promise.resolve();
      this.isAnimating = true;
      return new Promise((resolve) => {
        this.isModalBodyVisible = true;
        this.onBodyTransitionEnd = () => {
          if (this.isAnimating) this.isAnimating = false;
          resolve();
        };
      });
    },
    hideModalBody() {
      if (this.isFullScreen || this.isAnimating) return Promise.resolve();
      this.isAnimating = true;
      return new Promise((resolve) => {
        this.isModalBodyVisible = false;
        this.onBodyTransitionEnd = () => {
          if (this.isAnimating) this.isAnimating = false;
          resolve();
        };
      });
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
    modalContentHeight() {
      return withUnitOrPreserve(this.contentHeight, 'px', 'fit-content');
    },
    isFullScreen() {
      return this.type === 'full-screen';
    },
    modalWidth() {
      return withUnitOrPreserve(this.width, 'px', '50%');
    },
  },
  name: 'MSModalBase',
};
</script>

<style scoped>

.ms-modal-base.fullscreen .ms-modal-base_content {
  position: absolute;
  left: 5pt;
  right: 5pt;
  bottom: 5pt;
  top: 5px;
  /*noinspection CssUnresolvedCustomProperty*/ margin-top: var(--ms-title-inset, 0);
}

.modal-body.collapsable {
  max-height: 0;
  transition: max-height 0.5s;
}

.modal-body {
  box-shadow: inset 0 0 3pt 3pt whitesmoke;
}

.modal-content {
  width: unset;
}

/*noinspection CssUnresolvedCustomProperty*/
.height-max {
  max-height: var(--window-height, 500px)!important;
}

.backdrop {
  background-color: #00000088;
  z-index: var(--ms-component-level-dialog, 1000);
}

.modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  z-index: var(--ms-component-level-dialog, 1000);
}

.all-transition * {
  transition: all 0.3s ease-in-out;
}
</style>
