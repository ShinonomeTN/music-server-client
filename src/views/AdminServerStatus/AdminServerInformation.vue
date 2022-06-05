<template>
<div style="text-align: left; margin: 1rem">
  <div style="font-size: larger; font-weight: bold">Information of instance '{{ name }}'</div>
  <div class="mt-3">
    <div class="mb-3 row">
      <label class="col-sm-2 col-form-label">Hostname</label>
      <div class="col-sm-10">
        <div class="form-control" style="display: flex; align-items: center">
          <span class="badge me-1" :class="{
          'bg-success' : protocol === 'https',
          'bg-secondary' : protocol === 'http',
          'bg-warning' : protocol !== 'https' && protocol !== 'http'
        }"
          >{{protocol}}</span>
          <span>{{ host }}</span>
        </div>
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-2 col-form-label">Instance name</label>
      <div class="col-sm-10">
        <div class="input-group">
          <div class="form-control">{{ instanceName || '(Empty)' }}</div>
          <button class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-2 col-form-label">Description</label>
      <div class="col-sm-10">
        <div class="input-group">
          <div class="form-control">{{ instanceDescription || '(Empty)' }}</div>
          <button class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
    <div class="mb-3 row">
      <label class="col-sm-2 col-form-label">Greeting</label>
      <div class="col-sm-10">
        <div class="input-group">
          <div class="form-control">{{ instanceGreeting || '(Empty)' }}</div>
          <button class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  </div>
  <div>{{serverInfo}}</div>
</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
  name: 'AdminServerInformation',
  data() {
    return {

    };
  },
  async mounted() {
    await this.updateServerInfo();
  },
  methods: {
    ...mapActions('ServerInfo', ['updateServerInfo']),
  },
  computed: {
    name() {
      return this.serverInfo.name || this.serverInfo.host;
    },
    instanceName() {
      return this.serverInfo.name;
    },
    host() {
      return this.serverInfo.host;
    },
    protocol() {
      return this.serverInfo.protocol;
    },
    instanceDescription() {
      return this.serverInfo.description;
    },
    instanceGreeting() {
      return this.serverInfo.greeting;
    },
    ...mapGetters('ServerInfo', ['serverInfo']),
  },
};
</script>

<style scoped>

</style>
