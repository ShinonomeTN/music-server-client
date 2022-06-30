<template>
  <ms-nav-section-header icon="music-note-list" title="Playlist"/>
  <template v-if="status === 'success' && playlistCount > 0">
    <ms-nav-section-item v-for="({ playlist }) in recentPlaylists" icon="music-note-list" :title="playlist.title" :key="playlist.key"
                         @click="onItemClick(playlist)"
                         :class="[{'active' : navBarActivationKey === microRpcFormat('route_view', ['PlaylistView', [playlist.id]])}]"
    />
  </template>
  <template v-if="status === 'success'">
    <div style="display: flex; flex-flow: column; font-size: small">
      <div style="m-1">You have no playlist yet</div>
      <button class="btn btn-outline-primary btn-sm">
        <i class="bi-magnet"></i>
        <span> Explore</span>
      </button>
    </div>
  </template>
  <template v-else-if="status === 'loading'">
    <div style="display: flex; flex-flow: column; justify-content: center; align-items: center; font-size: small">
      <div class="spinner-border-sm bg-success; m-2"></div>
      <div>Loading Playlist...</div>
    </div>
  </template>
  <template v-else-if="status === 'error'">
    <div style="display: flex; flex-flow: column; justify-content: center; align-items: center;">
<!--      <i class=""></i>-->
    </div>
  </template>
</template>

<script>
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import MSNavSectionItem from '@/components/MSNavSectionItem.vue';
import { mapGetters } from 'vuex';
import MicroRpc from '@/common/micro-rpc';

export default {
  name: 'NavBarPlaylistSection',
  components: {
    'ms-nav-section-header': MSNavSectionHeader,
    'ms-nav-section-item': MSNavSectionItem,
  },
  methods: {
    microRpcFormat: MicroRpc.format,
    onItemClick(playlist) {
      const key = MicroRpc.format('route_view', ['PlaylistView', [playlist.id]]);
      if (this.navBarActivationKey !== key) {
        console.log(key);
      }
    },
  },
  computed: {
    ...mapGetters('UserPlaylist', ['status', 'recentPlaylists', 'playlistCount']),
    ...mapGetters(['navBarActivationKey']),
  },
};
</script>

<style scoped>

</style>
