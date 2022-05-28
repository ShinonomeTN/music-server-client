<template>
<div class="ms-cover-art-editor">
  <div class="ms-cover-art-editor-empty-view" v-if="isEmpty" :style="emptyViewStyle">
    <button class="btn btn-outline-success" @click="onAddCoverArt">
      <i class="bi-plus" />
      <span>Add Cover Art</span>
    </button>
  </div>
  <cover-art-select-modal :show="selectWindowShow" @close="selectWindowShow = false" />
</div>
</template>

<script>
import { withUnitOrPreserve } from '@/common/utils';
import CoverArtSelectModal from '@/components/CoverArtSelectModal.vue';

export default {
  name: 'CoverArtEditor',
  components: {
    CoverArtSelectModal,
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
      this.selectWindowShow = true
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
