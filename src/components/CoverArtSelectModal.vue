<template>
  <ms-modal-base :header="title" type="full-screen" :show-footer="false" :is-modal-show="show">

  </ms-modal-base>
</template>

<script>
import MSModalBase from '@/components/MSModalBase.vue';

export default {
  name: 'CoverArtSelectModal',
  components: {
    'ms-modal-base': MSModalBase,
  },
  props: {
    title: {
      type: String,
      default: 'Select a Cover Art',
    },
    show: Boolean,
  },
};
</script>

<style scoped>

</style>
