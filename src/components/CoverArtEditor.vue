<template>
<div class="ms-cover-art-editor">
<!--  <div class="ms-cover-art-editor-empty-view" v-if="isEmpty" :style="emptyViewStyle">-->
<!--    <button class="btn btn-success" @click="onAddCoverArt">-->
<!--      <i class="bi-plus-lg" />-->
<!--      <span>Add Cover Art</span>-->
<!--    </button>-->
<!--  </div>-->
  <div class="ms-cover-art-editor-cover-arts">
    <ms-item-overlay class="m-1" border-radius="10px" @click="onAddCoverArt">
      <ms-image-view width="100px" height="100px" border-radius="10px"
                     style="border: gray dashed 2pt; cursor: pointer"
                     background-color="transparent"
      >
        <template v-slot:empty-image>
          <div class="view-absolute" style="color: gray;display: flex; justify-content: center; align-items: center">
            <i class="bi-plus-lg"></i>
          </div>
        </template>
      </ms-image-view>
    </ms-item-overlay>
    <ms-item-overlay class="m-1" v-for="(item,index) in coverArtModal" :key="index" border-radius="10px"
                     fade-on-hover
    >
      <ms-image-view :src="item.preview" width="100px" height="100px" border-radius="10px" />
      <template v-slot:overlay-item>
        <button class="btn btn-danger" @click="onItemDelete(item)">
          <i class="bi-trash-fill" />
        </button>
      </template>
    </ms-item-overlay>
  </div>
  <cover-art-select-modal :show="selectWindowShow"
                          @close="selectWindowShow = false"
                          @submit="onSubmitNewItems"
  />
</div>
</template>

<script>
import { withUnitOrPreserve } from '@/common/utils';
import CoverArtSelectModal from '@/components/CoverArtSelectModal.vue';
import MSImageView from '@/components/MSImageView.vue';
import MSItemOverlay from '@/components/MSItemOverlay.vue';

export default {
  name: 'CoverArtEditor',
  components: {
    CoverArtSelectModal,
    'ms-item-overlay': MSItemOverlay,
    'ms-image-view': MSImageView,
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
    onSubmitNewItems(newItems) {
      this.coverArtModal.addAll(newItems);
      this.selectWindowShow = false;
    },
    onItemDelete(item) {
      this.coverArtModal.deleteWhere((item2) => item2 === item);
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

<style scoped>
.ms-image-view {
  background: transparent;

  overflow: hidden;
  transition: all 0.3s;
}

.ms-item-overlay {
  transition: all 0.3s;
  border-radius: 10px;
}

.ms-item-overlay:hover {
  box-shadow: 0 0 3px 3px #888A;
}

.ms-cover-art-editor {
  padding: 5px;
}
.ms-cover-art-editor-empty-view {
  display: flex;
  justify-content: center;
  align-items: center;
}
.ms-cover-art-editor-cover-arts {
  display: flex;
  overflow: scroll hidden;
}
</style>
