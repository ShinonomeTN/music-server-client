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
  <ms-modal-base :header="modal.title" :content="modal.content"
                 :is-modal-show="modal.isShow"
                 :show-close-button="false"
                 v-on:backdrop_click="closeModal"
                 ref="modal1"
  >
    <template v-slot:footer>
      <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-secondary"
              @click="modal.onNo"
      >
        <i class="bi-x-lg"/>
        <span style="flex-grow: 1;">NO</span>
      </button>
      <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-danger"
              @click="modal.onYes"
      >
        <i class="bi-circle"/>
        <span style="flex-grow: 1">YES</span>
      </button>
    </template>
  </ms-modal-base>
</template>
<script>
import appConfig from '@/config';
import { mapGetters, mapActions } from 'vuex';
import MSWindowTitleButton from '@/components/MSWindowTitleButton.vue';
import MSModalBase from '@/components/MSModalBase.vue';

export default {
  name: 'App',
  components: {
    'ms-window-title-button': MSWindowTitleButton,
    'ms-modal-base': MSModalBase,
  },
  methods: {
    onLogoutButtonClick() {
      if (this.modal.isAnimating) return;
      this.modal.title = 'Logout';
      this.modal.content = 'Are you sure to logging out from this server?';
      this.modal.isShow = true;
      this.modal.onNo = () => { this.closeModal(); };
      this.modal.onYes = () => { this.onLogout(); };
    },
    async onLogout() {
      await this.closeModal();
      setTimeout(async () => {
        await this.logout();
        await this.$router.push({ name: 'Login' });
      }, 300);
    },
    closeModal() {
      return new Promise((resolve) => {
        if (this.modal.isAnimating) {
          resolve();
          return;
        }
        this.modal.isAnimating = true;
        this.$refs.modal1.isModalBodyVisible = false;
        setTimeout(() => {
          this.modal.isShow = false;
          this.modal.isAnimating = false;
          resolve();
        }, 500);
      });
    },
    ...mapActions('UserInfo', ['logout']),
  },
  data() {
    return {
      modal: {
        isShow: false,
        isAnimating: false,
        title: '',
        content: '',
        onNo: () => {},
        onYes: () => {},
      },
    };
  },
  computed: {
    isNative() {
      return !appConfig.isWeb;
    },
    ...mapGetters(['showTitleBar', 'windowTitle']),
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
