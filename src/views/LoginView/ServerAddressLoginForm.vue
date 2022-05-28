<template>
  <div>
    <transition name="ani-zoom" mode="out-in">
      <div v-if="stage === 'input_server_info'">
        <div class="form-floating">
          <input type="url" class="form-control" id="server-address"
                 placeholder="http(s)://your.music.server"
                 v-model="inputServerInfoStage.serverAddress.value"
                 :class="{'is-invalid' : inputServerInfoStage.serverAddress.error }"
                 @focusout="validateServerInputForm"
                 @input="validateServerInputFormWhenInput"
          />
          <label for="server-address">Server Address</label>
          <div class="invalid-feedback" v-if="inputServerInfoStage.serverAddress.error">
            {{ inputServerInfoStage.serverAddress.error.message }}
          </div>
        </div>
        <div class="d-grid gap-3 pt-3">
          <button type="button" class="btn btn-primary" @click="onStartAccess"
                  :disabled="!inputServerInfoStage.isValid || inputServerInfoStage.isLoading">
            <span v-if="inputServerInfoStage.isLoading" class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            />
            <span v-else>Access</span>
          </button>
        </div>
      </div>

      <div v-else-if="stage === 'show_server_info'">
        <div v-if="serverInfo">
          <div style="display: flex; flex-flow: column; justify-content: center; align-items: center">
            <div style="font-weight: bold" class="p-3">
              <span>{{ serverInfo.name || serverInfo.host || serverUrl }}</span>
              <span class="ms-2 badge"
                    :class="{'bg-success' : serverInfo.protocol === 'https', 'bg-secondary' : serverInfo.protocol === 'http'}"
                    style="position: absolute"
              >
                <i v-if="serverInfo.protocol === 'https'" class="bi-shield-check"></i>
                <i v-if="serverInfo.protocol === 'http'" class="bi-shield-minus"></i>
                <span class="ps-2">{{ serverInfo.protocol.toUpperCase() }}</span>
              </span>
            </div>
            <div style="text-align: left">
              <div v-if="serverInfo.greeting"> {{serverInfo.greeting }} </div>
              <div v-if="serverInfo.description"> {{ serverInfo.description }}</div>
            </div>
            <div class="p-3" style="width: 300pt">
              <div class="row justify-content-center">
                <div class="col-1">
                  <i v-if="serverInfo.allowGuest" class="bi-check-square-fill" style="color: var(--bs-green)" />
                  <i v-if="!serverInfo.allowGuest" class="bi-x-square-fill" style="color: var(--bs-red)" />
                </div>
                <div class="col-11" style="text-align: left">
                  <span class="ps-2">This server <span v-if="!serverInfo.allowGuest">not </span>allow guest access.</span>
                </div>
              </div>
              <div class="row justify-content-center">
                <div class="col-1">
                  <i v-if="serverInfo.allowGuestRecordingAccess" class="bi-check-square-fill" style="color: var(--bs-green)" />
                  <i v-if="!serverInfo.allowGuestRecordingAccess" class="bi-x-square-fill" style="color: var(--bs-red)" />
                </div>
                <div class="col-11" style="text-align: left">
                  <span class="ps-2">This server <span v-if="!serverInfo.allowGuestRecordingAccess">not </span>allow guest recording access.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="d-grid gap-3 pt-3">
          <button type="button" class="btn btn-primary" :disabled="showServerInfoStage.isLoading" @click="onStartAuth">
            <span v-if="!showServerInfoStage.isLoading">Login</span>
            <span v-if="showServerInfoStage.isLoading"
                  class="spinner-border spinner-border-sm"></span>
          </button>
          <button type="button" class="btn btn-secondary" @click="stage = 'input_server_info'"
          >Change Server
          </button>
        </div>
      </div>

      <div v-else-if="stage === 'fetching_server_info'"
           style="display: flex; flex-flow: column; justify-content: center; align-items: center; width: inherit"
      >
        <div class="spinner-border m-3" style="width: 3rem; height: 3rem; color: var(--bs-orange)"></div>
        <span>Loading Server Info</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { FormField, fieldValidator, validateAllField } from '@/common/FormField';
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'ServerAddressLoginForm',
  emits: ['login_success'],
  data() {
    return {
      inputServerInfoStage: {
        serverAddress: new FormField(this.serverUrl, [
          fieldValidator((value) => value, 'Required'),
          fieldValidator((value) => value.match(/^http(s)?:\/\/[^:]+(:\d{1,5})?$/), 'Invalid Server Url'),
        ]),
        didFirstValidate: true,
        isValid: false,
        isLoading: false,
      },
      showServerInfoStage: {
        isLoading: false,
      },
      /** Current display state
       * @type {'fetching_server_info' | 'show_server_info' | 'input_server_info' }
       */
      stage: 'fetching_server_info',
    };
  },
  mounted() {
    this.initFetchServerInfo();
  },
  methods: {
    async initFetchServerInfo() {
      if (this.serverInfo == null) {
        try {
          await this.updateServerInfo();
        } catch (e) {
          console.warn('Could not fetch server info.', e);
          this.stage = 'input_server_info';
        }
      }
      this.stage = 'show_server_info';
    },

    async onStartAccess() {
      this.inputServerInfoStage.isLoading = true;
      const serverAddress = this.inputServerInfoStage.serverAddress.value;
      try {
        const serverConfig = await this.fetchServerInfo({ serverAddress });
        console.debug('Got server config: ', serverConfig);
        this.stage = 'show_server_info';
      } catch (e) {
        console.warn('Could not get server info: ', e)
        this.inputServerInfoStage.serverAddress.error = {
          message: 'Target server is not a Music Server Instance.',
        };
      } finally {
        this.inputServerInfoStage.isLoading = false;
      }
    },
    validateServerInputForm() {
      validateAllField(this.inputServerInfoStage);
    },
    validateServerInputFormWhenInput() {
      // if (this.form.didFirstValidate) return;
      validateAllField(this.inputServerInfoStage);
    },

    async onStartAuth() {
      const { serverUrl } = this;
      if (!serverUrl) return;

      this.showServerInfoStage.isLoading = true;
      try {
        await this.serverAddressLoginIn();
        this.$emit('login_success');
      } catch (e) {
        console.warn('Login canceled.', e);
      } finally {
        this.showServerInfoStage.isLoading = false;
      }
    },
    ...mapActions('ServerInfo', ['fetchServerInfo', 'updateServerInfo']),
    ...mapActions('UserInfo', ['serverAddressLoginIn']),
  },
  computed: {
    ...mapGetters('ServerInfo', ['serverUrl', 'serverInfo']),
  },
};
</script>

<style scoped>

</style>
