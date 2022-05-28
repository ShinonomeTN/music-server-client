<template>
<div style="display: flex;justify-content: center; align-items: center" class="view-fixed">
  <div style="min-width: 300px">
    <transition name="ani-bounce" mode="out-in">
      <div v-if="stage === 'login_view'">
        <div style="padding: 1rem 0">
          <span style="font-size: larger">Music Server</span>
        </div>
        <username-password-login-form v-if="isWeb" @login_success="onLoginSuccess"/>
        <server-address-login-form @login_success="onLoginSuccess" v-else/>
      </div>

      <div class="flex-column align-items-center" v-else-if="stage === 'check_login_state'">
        <div style="padding: 1rem 0">
          <span style="font-size: larger">Music Server</span>
        </div>
        <div class="spinner-border" style="width: 3rem; height: 3rem; color: var(--bs-orange)"></div>
        <div>Checking Login State<span style="position: absolute">...</span></div>
      </div>

      <div style="display: flex; flex-flow: column; align-items: center" v-else-if="stage === 'logged_in_welcome'">
        <span style="font-size: larger">Welcome</span>
        <span class="p-3">{{userInfo.nickname || userInfo.username}}</span>
      </div>
    </transition>
  </div>
</div>
</template>

<script>
import config from '@/config';
import ServerAddressLoginForm from '@/views/LoginView/ServerAddressLoginForm.vue';
import UsernamePasswordLoginForm from '@/views/LoginView/UsernamePasswordLoginForm.vue';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'LoginView',
  components: {
    ServerAddressLoginForm,
    UsernamePasswordLoginForm,
  },
  data: () => ({
    /** @type { 'check_login_state' | 'logged_in_welcome' | 'login_view' } */
    stage: 'check_login_state',
  }),
  mounted() {
    setTimeout(() => {
      this.fetchUserInfo();
    }, 1000);
    this.$store.commit('setShowTitleBar', false);
  },
  methods: {
    ...mapActions('UserInfo', ['fetchRemoteUserInfo']),
    async fetchUserInfo() {
      try {
        await this.fetchRemoteUserInfo();
        this.stage = 'logged_in_welcome';
        setTimeout(() => {
          this.$router.push({ name: 'Home' });
        }, 1000);
      } catch (e) {
        console.warn('Could not get user info.', e);
        this.stage = 'login_view';
      }
    },
    onLoginSuccess() {
      this.stage = 'check_login_state';
      this.fetchUserInfo();
    },
  },
  computed: {
    isWeb() {
      return config.isWeb;
    },
    ...mapGetters('UserInfo', ['userInfo']),
  },
};
</script>

<style scoped>

</style>
