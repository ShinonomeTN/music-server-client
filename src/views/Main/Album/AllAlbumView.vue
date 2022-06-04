<template>
  <div class="ms-safe-area-margin masked-overflow view-absolute"
       style="overflow-x: hidden; display: flex;"
  >
    <div style="display: flex;flex-wrap: wrap;place-content: flex-start">
      <album-card size="150px" class="m-2"
                  v-for="(item, index) in page.content" :key="index" :album="item.album"
                  @click="$router.push({ name: 'AlbumView', params: { albumId: item.album.id } })"
      />
    </div>
  </div>
</template>

<script>
import api from '@/api';
import AlbumCard from '@/components/AlbumCard.vue';

export default {
  name: 'AllAlbumView',
  components: {
    AlbumCard,
  },
  data() {
    return {
      page: {
        content: [],
        total: 0,
        hasNext: false,
        hasPrev: false,
        isLoading: false,
      },
      paging: {
        page: 0,
        size: 10,
      },
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      this.page.isLoading = true;
      try {
        const page = await api.album_listAll(this.paging);
        this.applyPageSettings(page);
      } finally {
        this.page.isLoading = false;
      }
    },
    applyPageSettings(page) {
      this.page.content.clear();
      this.page.content.addAll(page.content);
      this.page.total = page.total;
      this.page.hasNext = page.hasNext;
      this.page.hasPrev = page.hasPrev;
    },
  },
};
</script>

<style scoped>

</style>
