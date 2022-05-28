<template>
<div style="text-align: left">
  <div class="p-3 ms-2" style="font-size: large">Edit {{ albumModal.title.value }}</div>
  <ms-nav-section-header title="Album Basic Info" icon="info-square-fill" style="font-size: medium"/>
  <div class="ps-3 ms-2 me-3">
    <form class="form-floating">
      <input class="form-control" id="albumTitle" v-model="albumModal.title.value">
      <label for="floatingInputValue">Album Title</label>
    </form>
  </div>
  <ms-nav-section-header title="Cover Arts" icon="images" style="font-size: medium"/>
  <div class="ps-3 ms-2 me-3">
    <cover-art-editor image-size="100px" />
  </div>
</div>
</template>

<script>
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import CoverArtEditor from '@/components/CoverArtEditor.vue';
import { fieldValidator, FormField } from '@/common/FormField';

export default {
  name: 'AdminAlbumEdit',
  components: {
    'ms-nav-section-header': MSNavSectionHeader,
    CoverArtEditor,
  },
  props: {
    albumId: [Number, String],
  },
  data() {
    return {
      albumModal: {
        title: new FormField('New Album', [
          fieldValidator((value) => value, 'Album title should not be empty.'),
        ]),
      },
    };
  },
};
</script>

<style scoped>

</style>
