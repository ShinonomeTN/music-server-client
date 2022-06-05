<template>
  <div style="padding-top: 10px" class="recording-item">
    <div class="wrapper">
      <div class="title-container">
        <div style="background-color: white; padding: 0 2px; overflow: hidden">
          <input type="text" class="ms-input-no-style title-label protocol"
                 :class="{
                    'http': protocol === 'http',
                    'https': protocol === 'https',
                    'others': protocol !== 'http' && protocol !== 'https'
                 }"
                 :style="protocolStyle" :value="protocol" @input="$emit('update:protocol', $event.target.value)"
          />
          <input type="text" class="ms-input-no-style title-label server"
                 :style="serverStyle" :value="server" @input="$emit('update:server', $event.target.value)"
          />
        </div>
      </div>
      <input class="ms-input-no-style flex-grow-1" style="padding-left: 10px" :value="locationDecoded"
             @input="onLocationUpdate($event.target.value)"/>
      <button class="btn btn-danger btn-sm m-1" style="flex-grow: 0" @click="$emit('delete')">
        <i class="bi-trash-fill" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecordingItem',
  props: {
    server: {
      type: String,
      default: '192.168.1.153:8765',
    },
    protocol: {
      type: String,
      default: 'https',
    },
    location: {
      type: String,
      default: 'ORANGE%20RANGE%20-%20SUSHI%E9%A3%9F%E3%81%B9%E3%81%9F%E3%81%84%20feat.%20%E3%82%BD%E3%82%A4%E3%82%BD%E3%83%BC%E3%82%B9.mp3',
    },
  },
  emits: ['update:server', 'update:protocol', 'update:location', 'delete'],
  methods: {
    onLocationUpdate(value) {
      this.$emit('update:location', encodeURI(value));
    },
  },
  computed: {
    locationDecoded() {
      return decodeURI(this.location);
    },
    protocolStyle() {
      const { protocol } = this;
      return {
        width: `${protocol.length > 1 ? (protocol.length + 3) : 3}ch`,
        fontFamily: 'monospace',
        textAlign: 'center',
      };
    },
    serverStyle() {
      const { server } = this;
      return {
        width: `${server.length > 1 ? (server.length + 3) : 3}ch`,
        fontFamily: 'monospace',
        textAlign: 'center',
      };
    },
  },
};
</script>

<style scoped>
.recording-item {
  padding-top: 10px;
}

.recording-item .wrapper {
  display: flex;
  border: lightgray solid 1px;
  border-radius: 5px;
  position: relative;
}

.recording-item .title-container {
  position: absolute;

  top: -15px;
  left: 0;
  right: 0;

  margin: 0 10px;
  padding: 0 3px;

  overflow: hidden;

  white-space: nowrap;
  font-size: smaller;

  display: inline-flex;
  align-items: center;

  justify-content: left;
}

.recording-item .title-label {
  font-weight: bold;
  padding: 1px 5px;
  border-style: solid;
  min-width: 0;
  transition: width 0.1s;
}

.recording-item .title-label.protocol {
  color: white ;
  border-radius: 4px 0 0 4px;
  border-width: 1px 0 1px 1px;
  min-width: 0;
}

.recording-item .title-label.protocol.https {
  border-color: var(--bs-green);
  background-color: var(--bs-green);
}

.recording-item .title-label.protocol.http {
  border-color: var(--bs-secondary);
  background-color: var(--bs-secondary);
}

.recording-item .title-label.protocol.others {
  border-color: var(--bs-warning);
  background-color: var(--bs-warning);
  color: black!important;
}

.recording-item .title-label.server {
  color: black;
  background-color: whitesmoke;
  border-radius: 0 4px 4px 0;
  border-width: 1px 1px 1px 0;
  border-color: whitesmoke;
  min-width: 0;
}

.recording-item .content-container {

}
</style>
