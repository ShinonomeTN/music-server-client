<template>
  <div class="ms-card ms-album-card" :style="sizeStyles">
    <ms-image-view style="width: inherit; height: inherit" :src="coverArt">
      <template v-slot:empty-image>
        <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
          <i class="bi-collection-fill" style="color: var(--bs-light); font-size: 32px"></i>
        </div>
      </template>
    </ms-image-view>
    <div class="ms-album-card-content">
      <div class="ms-album-card-title">{{ name }}</div>
      <div class="ms-album-card-subtitle">{{ artists }}</div>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import MSImageView from '@/components/MSImageView.vue';

export default {
  components: {
    'ms-image-view': MSImageView,
  },
  props: {
    album: {
      type: Object,
      default: () => ({}),
    },
    size: {
      type: String,
      default: '100pt',
    },
  },
  name: 'AlbumCard',
  computed: {
    name() {
      return this.album.name || 'Unknown Song';
    },
    artists() {
      const { artists } = this.album;
      if (artists.isEmpty()) return 'Artist Unknown';
      if (artists.length <= 3) return artists.map((artist) => artist.name).join(' & ');
      if (artists.length <= 5) return (() => {
        const first = artists.take(3).map((artist) => artist.name).join(' & ');
        const last = artists.drop(3).length;
        return `${first} and ${last} more artists`;
      })();
      return 'Various Artists';
    },
    coverArt() {
      const { coverArts } = this.album;
      if (coverArts.isEmpty()) return null;
      return api.config.coverArtUrlOf(coverArts[0].filePath);
    },
    sizeStyles() {
      return {
        width: this.size,
        minWidth: this.size,
        height: this.size,
        minHeight: this.size,
      };
    },
  },
};
</script>

<style>
.ms-album-card:hover .ms-album-card-content {
  transition: padding-top 0.3s;
  padding-top: 50px;
}
.ms-album-card-content {
  text-align: left;
  padding: 15px 5px 5px 5px;
  transition: padding-top 0.3s;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to bottom, transparent 5pt, #000A 30pt, #000A);
  color: var(--bs-light);
  text-shadow: 0 0 2px black;
}
.ms-album-card-title {
  text-overflow: ellipsis;
  overflow: hidden;
  /*white-space: nowrap;*/
  font-size: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}
.ms-album-card-subtitle {
  text-overflow: ellipsis;
  overflow: hidden;
  /*white-space: nowrap;*/
  font-size: 12px;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  margin: 0;
}
</style>
