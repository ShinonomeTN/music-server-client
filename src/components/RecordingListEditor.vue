<template>
<ms-modal-base type="full-screen" header="Editing Recording List" :is-modal-show="show"
               @close="onClose" @cancel="onClose" @confirm="onSubmit"

>
  <div>
    <div class="m-3">
      <div class="input-group mb-3" v-for="(item,index) in internalList" :key="index">
        <input type="url" class="form-control" placeholder="Recording URL" v-model="item.url">
        <button class="btn btn-danger" type="button" @click="onDeleteRecording(index)">
          <i class="bi-trash-fill" />
        </button>
      </div>
    </div>
    <div class="m-3">
      <button class="btn btn-success" style="width: 100%" @click="onAddRecording">
        <i class="bi-plus-lg" />
        <span> Add Recording</span>
      </button>
    </div>
  </div>
</ms-modal-base>
</template>

<script>
import MSModalBase from '@/components/MSModalBase.vue';

export default {
  name: 'RecordingListEditor',
  props: {
    show: Boolean,
    recordingList: Array,
  },
  components: {
    'ms-modal-base': MSModalBase,
  },
  emits: ['submit'],
  mounted() {
    this.initData();
  },
  methods: {
    initData() {
      if (this.recordingList) this.internalList.addAll(this.recordingList);
    },
    onClose() {
      this.internalList.clear();
      this.$emit('close');
    },
    onSubmit() {
      this.$emit('submit', [...this.internalList]);
      this.internalList.clear();
    },
    onAddRecording() {
      this.internalList.push({ url: '' });
    },
    onDeleteRecording(index) {
      this.internalList.delete(index);
    },
  },
  data() {
    return {
      internalList: [],
    };
  },
  watch: {
    show() {
      if (this.show) this.initData();
    },
  },
};
</script>

<style scoped>

</style>
