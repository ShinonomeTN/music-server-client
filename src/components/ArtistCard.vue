<template>
  <div class="ms-artist-card" :style="styles">
    <ms-image-view class="ms-artist-card-image" style="width: inherit; height: inherit" :src="coverArt">
      <template v-slot:empty-image>
        <div class="view-absolute"
             style="display: flex; justify-content: center; align-items: center">
          <i class="bi-person-fill" :style="emptyImageStyle"/>
        </div>
      </template>
    </ms-image-view>
    <div class="ms-artist-card-title" style="position: absolute; left: 0; right: 0; bottom: 0">
      <span style="font-size: medium">{{ artist.name }}</span>
    </div>
  </div>
</template>

<script>
import api from '@/api';
import MSImageView from '@/components/MSImageView.vue';
import { parseScalarAndUnit, withUnitOrPreserve } from '@/common/utils';

export default {
  name: 'ArtistCard',
  props: {
    artist: Object,
    size: [Number, String],
  },
  components: {
    'ms-image-view': MSImageView,
  },
  computed: {
    emptyImageStyle() {
      return {
        fontSize: withUnitOrPreserve((() => {
          const item = parseScalarAndUnit(this.size);
          return `${item.value / 2}${item.unit}`;
        })(), 'px', '16px'),
      };
    },
    styles() {
      const size = {
        width: withUnitOrPreserve(this.size, 'px', '24px'),
        height: withUnitOrPreserve(this.size, 'px', '24px'),
      };
      return {
        ...size,
        minWidth: size.width,
        minHeight: size.height,
      };
    },
    coverArt() {
      const first = this.artist.coverArts.first();
      if (!first) return null;
      return api.config.coverArtUrlOf(first.filePath);
    },
  },
};
</script>

<style>
.ms-artist-card {
  position: relative;
  overflow: hidden;
  border-radius: 5px;
}

.ms-artist-card:hover > .ms-artist-card-title {
  padding-top: 15px;
  transition: padding-top 0.3s;
}

.ms-artist-card-title {
  transition: padding-top 0.3s;
  padding: 5pt;
  color: white;
  text-shadow: black 0 0 2px;
  background: linear-gradient(to bottom, transparent 5px, #000A 30px, #000A);
}

.ms-artist-card-image {
  width: inherit;
  height: inherit;
}
</style>
