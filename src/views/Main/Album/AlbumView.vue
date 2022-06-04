<template>
<div style="display: flex; flex-flow: column; flex-grow: 1">
  <div style="display: flex;margin-left: 1rem">
    <ms-imageview style="margin: 1rem;" border-radius="10px" :src="coverArt" width="200px" height="200px">
      <template v-slot:empty-image>
        <div class="view-absolute" style="display: flex; flex-flow: column ;justify-content: center; align-items: center; flex-grow: 1">
          <i class="bi-collection-fill" style="font-size: 50px"></i>
        </div>
      </template>
    </ms-imageview>
    <div style="flex-grow: 1; text-align: left; justify-content: center; flex-flow: column; display: flex">
      <div style="font-size: 25px; font-weight: bold; margin: 5px">{{title}}</div>
      <h3 style="font-size: medium; margin: 5px">{{ artists }}</h3>
    </div>
  </div>
  <div style="margin: 1rem 1rem 1rem 0;" class="ms-flex-scrollable-container">
    <div class="content-wrapper" style="overflow: hidden scroll">
      <div class="content">
        <template v-for="(_, diskIndex) in disks" :key="diskIndex">
          <ms-nav-section-header :title="`Disk ${diskIndex + 1}`" icon="vinyl-fill" ></ms-nav-section-header>
          <div class="ms-2 me-2 track-item" v-for="(track, trackIndex) of disks[diskIndex]" :key="trackIndex">
            <div style="font-weight: bold; min-width: 2rem; text-align: center">{{track.trackNumber}}</div>
            <div style="flex-grow: 1; text-align: left">{{track.title}}</div>
            <div>{{artistSummaryOf(track.artists)}}</div>
          </div>
        </template>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import MSImageView from '@/components/MSImageView.vue';
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import api from '@/api';

export default {
  name: 'AlbumView',
  components: {
    'ms-imageview': MSImageView,
    'ms-nav-section-header': MSNavSectionHeader,
  },
  props: ['albumId'],
  data() {
    return {
      album: {},
      disks: [],
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      const { album } = await api.album_get(this.albumId);
      this.album = album;

      const data = await api.album_tracks(this.albumId);
      this.disks.clear();
      const disks = data.map((bean) => bean.track).groupBy((track) => track.diskNumber);
      this.disks.addAll(Object.entries(disks)
        .sort(([a], [b]) => parseInt(a || '0', 10) - parseInt(b || '0', 10))
        .map(([, disk]) => {
          disk.sort((track) => track.trackNumber);
          return disk;
        }));
    },
    artistSummaryOf(artists) {
      if (!artists || artists.isEmpty()) return 'Artist Unknown';
      const names = artists.map((artist) => artist.name);
      if (names.length <= 3) return names.join(' & ');
      if (names.length <= 10) {
        const first3 = names.take(3);
        const remaining = names.drop(3).length;
        return `${first3.join(' & ')} and ${remaining} artists`;
      }
      return 'Various Artists';
    },
  },
  computed: {
    coverArt() {
      const { album } = this;
      if (!album || !album.coverArts) return null;
      const coverArt = album.coverArts.first();
      if (!coverArt) return null;
      return api.config.coverArtUrlOf(coverArt.filePath);
    },
    title() {
      const { album } = this;
      if (!album) return null;
      return album.name;
    },
    artists() {
      const { album } = this;
      if (!album) return null;
      const { artists } = album;
      return this.artistSummaryOf(artists)
    },
  },
};
</script>

<style scoped>
.track-item {
  display: flex;
  padding: 1rem;
  font-size: smaller;
  border-radius: 10px;
}

.track-item:hover {
  background-color: var(--ms-button-heightlight-bg-color);
}
</style>
