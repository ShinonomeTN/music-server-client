<template>
<div style="text-align: left; margin: 1rem">
  <div style="font-size: larger; font-weight: bold">Information of instance '{{ name }}'</div>
  <div>{{serverInfo}}</div>
</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'AdminServerInformation',
  data() {
    return {

    };
  },
  mounted() {

  },
  methods: {

  },
  computed: {
    name() { return this.serverInfo.name || this.serverInfo.host },
    ...mapGetters('ServerInfo', ['serverInfo']),
  },
};
</script>

<style scoped>

</style>
