<template>
<div class="ms-cover-art-editor">
  <div class="ms-cover-art-editor-empty-view" v-if="isEmpty" :style="emptyViewStyle">
    <button class="btn btn-success" @click="onAddCoverArt">
      <i class="bi-plus-lg" />
      <span>Add Cover Art</span>
    </button>
  </div>
  <div class="ms-cover-art-editor-cover-arts">
    <ms-item-overlay v-for="(item,index) in coverArtModal" :key="index">
      {{item}}
    </ms-item-overlay>
  </div>
  <cover-art-select-modal :show="selectWindowShow"
                          @close="selectWindowShow = false"
                          @submit="onAddNewItems"
  />
</div>
</template>

<script>
import { withUnitOrPreserve } from '@/common/utils';
import CoverArtSelectModal from '@/components/CoverArtSelectModal.vue';
import MSItemOverlay from '@/components/MSItemOverlay.vue';

export default {
  name: 'CoverArtEditor',
  components: {
    CoverArtSelectModal,
    'ms-item-overlay': MSItemOverlay,
  },
  props: {
    imageSize: [Number, String],
  },
  data() {
    return {
      coverArtModal: [],
      selectWindowShow: false,
    };
  },
  methods: {
    onAddCoverArt() {
      this.selectWindowShow = true;
    },
    onAddNewItems(newItems) {
      this.coverArtModal.addAll(newItems);
    },
  },
  computed: {
    isEmpty() {
      return this.coverArtModal.isEmpty();
    },
    emptyViewStyle() {
      const size = withUnitOrPreserve(this.imageSize, 'px', '100px');
      return {
        height: size,
        minHeight: size,
      };
    },
  },
};
</script>

<style>
.ms-cover-art-editor {
  padding: 5px;
}
.ms-cover-art-editor-empty-view {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
