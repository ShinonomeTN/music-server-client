<template>
  <div>
    <ms-nav-section-header style="font-size: medium" icon="collection-fill" title="Recent Albums" />
    <div style="padding: 10pt 0; display: flex; white-space: nowrap; overflow-x: scroll; overflow-y: hidden">
      <button-card class="m-1" text="New Album" size="150px" style="background: whitesmoke; display: inline-block"
                   @click="$router.push({ name: 'AdminAlbumCreate'})"
      />
      <album-card class="m-1" v-for="({ album }) in recentAlbums" :key="album.id" :album="album"
                  size="150px" style="display: inline-block" @click="$router.push({ name: 'AdminAlbumEdit', params: { albumId : album.id }})"
      />
    </div>
    <ms-nav-section-header style="font-size: medium" icon="person-square" title="Recent Artists" />
    <div style="overflow-y: hidden; overflow-x: scroll; padding: 1rem 0; white-space: nowrap">
      <button-card class="m-1" text="New Artist" size="150px" style="background: whitesmoke; display: inline-block"
      ></button-card>
      <artist-card class="m-1" v-for="(item) in recentArtist" :key="item.artist.id" :artist="item.artist" size="150px"
                   style="display: inline-block"
      />
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
