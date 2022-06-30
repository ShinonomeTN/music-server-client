<template>
  <router-view v-slot="{ Component }">
    <transition name="ani-switch-keep-position">
      <component :is="Component" />
    </transition>
  </router-view>
  <div v-if="isNative" class="ms-title-bar">
    <transition name="ani-top-dock">
      <div class="title-bar-layer" v-if="showTitleBar">{{ windowTitle }}</div>
    </transition>
    <div class="title-bar-layer" style="justify-content: flex-end">
      <div style="-webkit-app-region: drag;color: white" class="flex-grow-1" >
        <div style="color: transparent">-</div>
      </div>
      <transition name="ani-right-dock">
        <div v-if="showTitleBar">
          <ms-window-title-button icon="power" @click="onLogoutButtonClick"/>
        </div>
      </transition>
    </div>
  </div>
  <ms-modal-base :header="modalTitle" :content="modalContent"
                 :is-modal-show="modalShow"
                 :show-close-button="modalShowCloseButton"
                 v-on:backdrop_click="modalOnCancel"
                 ref="modal1" :footer-type="modalButtonType"
                 @confirm="modalOnConfirm"
                 @cancel="modalOnCancel"
                 width="50%"
                 :confirm-text="modalConfirmText"
                 :cancel-text="modalCancelText"
  >
  </ms-modal-base>
</template>
<script>
import appConfig from '@/config';
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex';
import MSWindowTitleButton from '@/components/MSWindowTitleButton.vue';
import MSModalBase from '@/components/MSModalBase.vue';

export default {
  name: 'App',
  components: {
    'ms-window-title-button': MSWindowTitleButton,
    'ms-modal-base': MSModalBase,
  },
  mounted() {
    this.setGlobalModalRef(this.$refs.modal1);
  },
  methods: {
    onLogoutButtonClick() {
      this.showGlobalModal({
        title: 'Logout',
        content: 'Are you sure to logging out from this server?',
        onConfirm: this.onLogout,
        onCancel: this.closeModal,
        buttonType: 'sao-yes-no',
      });
    },
    async onLogout() {
      await this.closeModal();
      setTimeout(async () => {
        await this.logout();
        await this.$router.push({ name: 'Login' });
      }, 300);
    },
    closeModal() {
      return this.hideGlobalModal();
    },
    ...mapActions('UserInfo', ['logout']),
    ...mapActions('GlobalModal', ['showGlobalModal', 'hideGlobalModal']),
    ...mapMutations('GlobalModal', ['setGlobalModalRef']),
  },
  data() {
    return {

    };
  },
  computed: {
    isNative() {
      return !appConfig.isWeb;
    },
    ...mapGetters(['showTitleBar', 'windowTitle']),
    ...mapState('GlobalModal', {
      modalShow: (state) => state.show,
      modalTitle: (state) => state.title,
      modalContent: (state) => state.content,
      modalShowCloseButton: (state) => state.showCloseButton,
      modalButtonType: (state) => state.buttonType,
      modalOnConfirm: (state) => state.onConfirm,
      modalOnCancel: (state) => state.onCancel,
      modalConfirmText: (state) => state.confirmText,
      modalCancelText: (state) => state.cancelText,
    }),
  },
};
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.ms-title-bar {
  position: fixed; top: 0; left: 0; right: 0;
  /*noinspection CssUnresolvedCustomProperty*/ height: var(--ms-title-inset, 0);
  /*z-index: 9999;*/
  display: flex;
  overflow: hidden;
  font-size: small;
  font-weight: bold;
}

.ms-title-bar .title-bar-layer {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}
</style>
