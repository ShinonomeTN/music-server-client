<template>
  <ms-modal-base :header="title" type="full-screen" :is-modal-show="show" @close="onClose">
    <div class="view-absolute" style="padding: 1rem; display: flex">
      <div class="pe-1" style="min-width: 200px; display: flex; flex-flow: column; justify-content: center">
        <ms-section-item icon="cloud-arrow-up-fill" class="p-2" style="font-size: medium" title="Upload"
                         :class="{active: stage === 'upload'}" @click="switchStage('upload')"
        />
        <ms-section-item icon="images" class="p-2" style="font-size: medium" title="Explore"
                         :class="{active: stage === 'explore'}" @click="switchStage('explore')"
        />
      </div>
      <div class="vr"></div>
      <input type="file" hidden multiple accept="image/*" ref="file" @change="onFileChanged" />

      <!-- Upload -->
      <div v-if="stage === 'upload' "
           style="flex-grow: 1; display: flex;"
           :style="uploadStageStyle"
      >
        <div style="display: flex; flex-flow: column" v-if="uploadStage.items.isEmpty()">
          <ms-item-overlay style="border: gray dashed 2pt; cursor: pointer" border-radius="10px"
                           @click="onOpenFile"
          >
            <ms-image-view width="200px" height="200px"
                           background-color="transparent" border-radius="10px"
            >
              <template v-slot:empty-image>
                <div class="view-absolute"
                     style="display: flex; flex-flow: column;
                     justify-content: center; align-items: center;
                    color: gray;"
                >
                  <i class="bi-plus-lg" style="font-size: 50px"/>
                  <span class="m-1">Upload Files</span>
                </div>
              </template>
            </ms-image-view>
          </ms-item-overlay>
        </div>
        <div v-else style="flex-grow: 1; display: flex; flex-wrap: wrap; align-content: flex-start; align-items: center"
             class="m-3"
        >
          <ms-item-overlay class="m-1" border-radius="10px" v-for="(item,index) in uploadStage.items" :key="index"
                           fade-on-hover
          >
            <ms-image-view :src="item.image" border-radius="10px" width="100px" height="100px"/>
            <template v-slot:overlay-item>
              <button class="btn btn-sm btn-danger" @click="deleteUploadItem(index)">
                <i class="bi-trash-fill"></i>
              </button>
            </template>
          </ms-item-overlay>
          <ms-item-overlay style="cursor: pointer" border-radius="10px" @click="onOpenFile">
            <ms-image-view width="100px" height="100px"
                           background-color="transparent" border-radius="10px"
                           style="border: gray dashed 2pt"
            >
              <template v-slot:empty-image>
                <div class="view-absolute flex-column justify-content-center align-items-center"
                     style="display: flex; color: gray;"
                >
                  <i class="bi-plus-lg" style="font-size: 24px"/>
                </div>
              </template>
            </ms-image-view>
          </ms-item-overlay>
        </div>
      </div>

      <!-- Explorer -->
      <div v-else-if="stage === 'explore'" class="m-3" style="display: flex; flex-grow: 1; flex-flow: column">
        <div style="flex-grow: 1; display: flex; flex-wrap: wrap; align-content: flex-start; align-items: stretch;">
          <ms-item-overlay v-for="(item) in exploreStage.page.content" :key="item.coverArt.id"
                           style="display: inline-block" class="m-1" border-radius="10px"
                           :class="{ active: idSelected(item.coverArt) } "
                           @click="exploreSelectItem(item.coverArt)"
                           active-background-color="#8888"
          >
            <ms-image-view width="100px" height="100px" border-radius="10px"
                           :src="coverArtUrl(item.coverArt.filePath)"
            />
            <template v-slot:overlay-active>
              <i class="bi-check-circle-fill" style="font-size: 24px; color: orange" />
            </template>
          </ms-item-overlay>
        </div>
        <ms-pagination
          :pagination="exploreStage.pagination"
          :shown-page-count="10"
          @next="exploreStage.pagination.page += 1; loadRecentCoverArts()"
          @prev="exploreStage.pagination.page -= 1; loadRecentCoverArts()"
          @jump="exploreStage.pagination.page = $event; loadRecentCoverArts()"
        />
      </div>
    </div>
    <!--  Modal footer  -->
    <template v-slot:footer>
      <div style="flex-grow: 1; display: flex; align-items: center">
        <div class="pe-2">
          <button :disabled="!canSubmit" class="btn btn-danger" @click="onClearAll">
            <i class="bi-trash-fill"/>
            <span>Clear All</span>
          </button>
        </div>
        <span v-if="selectedItemCount > 0"
        >Selected {{ selectedItemCount }} item<span v-if="selectedItemCount > 1">s</span>.</span>
        <span> </span>
        <span v-if="uploadItemCount > 0"
        >Upload {{ uploadItemCount }} item<span v-if="uploadItemCount > 1">s</span></span>
      </div>
      <button class="btn btn-secondary" style="width: 8rem" @click="onClose">Cancel</button>
      <button class="btn btn-success" style="width: 8rem" :disabled="!canSubmit" @click="onSubmit">OK</button>
    </template>
  </ms-modal-base>
  <ms-modal-base :header="modal.title"
                 :content="modal.content"
                 :is-modal-show="modal.isShow"
                 :show-close-button="false"
                 width="50%" ref="modal"
  >
    <template v-slot:footer>
      <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-secondary"
              @click="modal.onNo"
      >
        <i class="bi-x-lg"/>
        <span style="flex-grow: 1;">NO</span>
      </button>
      <button style="flex-grow: 1; display: flex; align-items: center" class="btn btn-danger"
              @click="modal.onYes"
      >
        <i class="bi-circle"/>
        <span style="flex-grow: 1">YES</span>
      </button>
    </template>
  </ms-modal-base>
</template>

<script>
import MSModalBase from '@/components/MSModalBase.vue';
import MSNavSectionItem from '@/components/MSNavSectionItem.vue';
import MSImageView from '@/components/MSImageView.vue';
import MSItemOverlay from '@/components/MSItemOverlay.vue';
import MSPagination from '@/components/MSPagination.vue';

import api from '@/api';

export default {
  name: 'CoverArtSelectModal',
  components: {
    'ms-modal-base': MSModalBase,
    'ms-section-item': MSNavSectionItem,
    'ms-image-view': MSImageView,
    'ms-item-overlay': MSItemOverlay,
    'ms-pagination': MSPagination,
  },
  props: {
    title: {
      type: String,
      default: 'Select a Cover Art',
    },
    show: Boolean,
  },
  emits: ['close', 'submit'],
  data() {
    return {
      /** @type { 'upload' | 'explore' } */
      stage: 'upload',
      uploadStage: {
        items: [],
      },
      exploreStage: {
        page: {
          content: [],
        },
        isLoading: false,
        pagination: {
          page: 0,
          size: 20,
          hasNext: false,
          hasPrev: false,
          totalPage: 0,
        },
        selectedIds: [],
      },
      modal: {
        title: '',
        content: '',
        isShow: false,
        onYes: () => {},
        onNo: () => {},
      },
    };
  },
  methods: {
    onSubmit() {
      this.$emit('submit', [

        ...this.uploadStage.items.map((item) => ({
          type: 'file',
          data: item.file,
          preview: item.image,
        })),

        ...this.exploreStage.selectedIds.map((item) => ({
          type: 'cover-art',
          data: item,
          preview: api.config.coverArtUrlOf(item.filePath),
        })),
      ]);
      this.reset();
    },
    onClose() {
      if (this.canSubmit) {
        const { modal } = this;
        modal.title = 'Leaving Selecting';
        modal.content = 'There are items be selected, your selection will be discard. Would you want to leave?';
        modal.onYes = () => {
          this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShow = false;
            this.reset();
            this.$emit('close');
          });
        };
        modal.onNo = () => {
          this.$refs.modal.hideModalBody().then(() => {
            this.modal.isShow = false;
          });
        };
        modal.isShow = true;
        return;
      }
      this.$emit('close');
    },
    onClearAll() {
      const { modal } = this;
      modal.title = 'Clear all selected';
      modal.content = 'Are you sure to clear all selected item and items that waiting for upload?';
      modal.onYes = () => {
        this.$refs.modal.hideModalBody().then(() => {
          this.modal.isShow = false;
          this.reset();
        });
      };
      modal.onNO = () => {
        this.$refs.modal.hideModalBody().then(() => {
          this.modal.isShow = false;
        });
      };
      modal.isShow = true;
    },
    switchStage(stage) {
      if (this.stage !== stage) this.stage = stage;
    },
    onFileChanged() {
      const input = this.$refs.file;
      const selectedFiles = [];
      for (const file of input.files) selectedFiles.push(file);
      if (selectedFiles.isEmpty()) {
        return;
      }
      this.uploadStage.items.addAll(selectedFiles.map((file) => ({
        file,
        image: URL.createObjectURL(file),
      })));
      console.log(this.uploadStage.items);
    },
    onOpenFile() {
      const { file } = this.$refs;
      file.value = null;
      file.click();
    },
    async loadRecentCoverArts() {
      this.exploreStage.isLoading = true;
      try {
        const coverArts = await api.coverArt_listAll({
          ...this.exploreStage.pagination,
          sort: 'create_date,desc',
        });
        this.exploreStage.page.content.clear();
        this.exploreStage.page.content.addAll(coverArts.content);
        this.exploreStage.pagination.hasNext = coverArts.hasNext;
        this.exploreStage.pagination.hasPrev = coverArts.hasPrev;
        this.exploreStage.pagination.totalPage = coverArts.totalPageCount;
      } finally {
        this.exploreStage.isLoading = false;
      }
    },
    reset() {
      this.exploreStage.selectedIds.clear();
      this.uploadStage.items.clear();
      this.$refs.file.value = null;
    },
    onStageSwitch() {
      switch (this.stage) {
        case 'explore':
          this.loadRecentCoverArts();
          break;
        case 'upload':
          break;
        default:
          break;
      }
    },
    exploreSelectItem(item) {
      if (this.idSelected(item)) {
        this.exploreStage.selectedIds.deleteWhere((item2) => item2.id === item.id);
        return;
      }
      this.exploreStage.selectedIds.push(item);
    },
    coverArtUrl(filePath) {
      return api.config.coverArtUrlOf(filePath);
    },
    idSelected(item) {
      return this.exploreStage.selectedIds.find((item2) => item2.id === item.id) !== undefined;
    },
    deleteUploadItem(index) {
      this.uploadStage.items.delete(index);
    },
  },
  computed: {
    canSubmit() {
      return (!this.uploadStage.items.isEmpty()) || (!this.exploreStage.selectedIds.isEmpty());
    },
    uploadStageStyle() {
      return this.uploadStage.items.isEmpty() ? {
        'flex-flow': 'column',
        'justify-content': 'center',
        'align-items': 'center',
      } : {};
    },
    selectedItemCount() {
      return this.exploreStage.selectedIds.length;
    },
    uploadItemCount() {
      return this.uploadStage.items.length;
    },
  },
  watch: {
    stage() {
      this.onStageSwitch();
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
</style>
