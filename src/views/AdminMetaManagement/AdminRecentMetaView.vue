<template>
  <div style="flex-grow: 1">
    <div class="flex-column align-items-center">
      <ms-nav-section-header style="font-size: medium" icon="collection-fill" title="Recent Albums" />
      <div style="overflow-y: hidden; overflow-x: scroll; display: flex; padding: 1rem 0">
        <button-card class="m-1" text="New Album" size="200px" style="background: whitesmoke"
                     @click="$router.push({ name: 'AdminAlbumCreate'})"
        />
        <album-card class="m-1" v-for="(item) in recentAlbums" :key="item.album.id" :album="item.album"
                    width="200px" style="height: 200px; min-height: 200px; display: inline-block"
        />
      </div>
    </div>
    <div class="flex-column align-items-center">
      <ms-nav-section-header style="font-size: medium" icon="person-square" title="Recent Artists" />
      <div style="overflow-y: hidden; overflow-x: scroll; display: flex; padding: 1rem 0">
        <button-card class="m-1" text="New Artist" size="200px" style="background: whitesmoke"></button-card>
        <artist-card class="m-1" v-for="(item) in recentArtist" :key="item.artist.id" :artist="item.artist" size="200px"/>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/api';

import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import AlbumCard from '@/components/AlbumCard.vue';
import ArtistCard from '@/components/ArtistCard.vue';
import ButtonCard from "@/components/ButtonCard.vue";

export default {
  name: "AdminRecentMetaView",
  components: {
    'ms-nav-section-header': MSNavSectionHeader,
    AlbumCard,
    ArtistCard,
    ButtonCard,
  },
  data() {
    return {
      recentAlbums: [],
      recentAlbumsIsLoading: false,
      recentArtist: [],
      recentArtistIsLoading: false,
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.fetchRecentAlbums();
      await this.fetchRecentArtists();
    },
    async fetchRecentAlbums() {
      this.recentAlbumsIsLoading = true;
      try {
        const albums = await api.album_listAll({ page: 0, size: 10, sort: 'create_date,desc' });
        this.recentAlbums.clear();
        this.recentAlbums.addAll(albums.content);
      } finally {
        this.recentAlbumsIsLoading = false;
      }
    },
    async fetchRecentArtists() {
      this.recentArtistIsLoading = true;
      try {
        const artist = await api.artist_listAll({ page: 0, size: 10, sort: 'create_date,desc' });
        this.recentArtist.clear();
        this.recentArtist.addAll(artist.content);
      } finally {
        this.recentArtistIsLoading = false;
      }
    },
  },
}
</script>

<style scoped>

</style>
