<template>
<div>
  <div class="form-floating mb-3">
    <input type="text" class="form-control" id="username" placeholder="Your username"
           v-model="loginInputStage.username.value"
           :class="{'is-invalid' : loginInputStage.username.error }"
           @focusout="validateUsernamePasswordForm"
           @keydown="validateUsernamePasswordForm"
    >
    <label for="username">Username</label>
    <div class="invalid-feedback" v-if="loginInputStage.username.error">
      {{ loginInputStage.username.error.message }}
    </div>
  </div>
  <div class="form-floating">
    <input type="password" class="form-control"
           v-model="loginInputStage.password.value" id="password" placeholder="Password"
           :class="{'is-invalid' : loginInputStage.password.error }"
           @focusout="validateUsernamePasswordForm"
           @keydown="validateUsernamePasswordForm"
    >
    <label for="password">Password</label>
    <div class="invalid-feedback" v-if="loginInputStage.password.error">
      {{ loginInputStage.password.error.message }}
    </div>
  </div>
  <div class="d-grid gap-3 pt-3">
    <button type="button" class="btn btn-primary"
            :disabled="loginInputStage.isLoading || !loginInputStage.isValid"
            @click="onLogin"
    >
      <span v-if="loginInputStage.isLoading" class="spinner-border spinner-border-sm"></span>
      <span v-else>Login</span>
    </button>
  </div>
</div>
</template>

<script>
import { fieldValidator, FormField, validateAllField } from '@/common/FormField';
import { mapActions } from 'vuex';

export default {
  name: 'UsernamePasswordLoginForm',
  emits: ['login_success'],
  data() {
    return {
      loginInputStage: {
        didFirstValidate: true,
        isValid: false,
        isLoading: false,
        username: new FormField(null, [
          fieldValidator((value) => value, 'Username is required.'),
          fieldValidator((value) => value.match(/^\w{4,64}$/), 'Invalid username format.'),
        ]),
        password: new FormField(null, [
          fieldValidator((value) => value, 'Password is required.'),
          fieldValidator((value) => value.length <= 64, 'Invalid password'),
        ]),
      },
      stage: 'input-credential',
    };
  },
  methods: {
    validateUsernamePasswordForm() {
      validateAllField(this.loginInputStage);
    },
    async onLogin() {
      this.loginInputStage.isLoading = true;
      try {
        await this.usernamePasswordLogin({
          username: this.loginInputStage.username.value,
          password: this.loginInputStage.password.value,
        });
        await this.fetchRemoteUserInfo();
        this.$emit('login_success');
      } catch (e) {
        console.info('Login failed', e);
      } finally {
        this.loginInputStage.isLoading = false;
      }
    },
    ...mapActions('UserInfo', ['usernamePasswordLogin', 'fetchRemoteUserInfo']),
  },
};
</script>

<style scoped>

</style>
