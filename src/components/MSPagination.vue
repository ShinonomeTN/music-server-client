<template>
<div class="ms-pagination">
  <div class="ms-pagination-container">
    <button class="btn btn-sm btn-outline-primary" :disabled="page === 0"
            @click="$emit('prev')"
    >
      <i class="bi-caret-left-fill"></i>
    </button>

    <div class="btn-group ms-2 me-2">
      <button class="btn btn-sm btn-outline-primary"
              :disabled="sectionIndex <= 0"
              @click="$emit('jump', (section[0] - 1) - 1)"
      >...</button>

      <button class="btn btn-sm"
              v-for="(item) in section" :key="item"
              :class="{'btn-outline-primary' : (page + 1) !== item, 'btn-primary': (page + 1) === item}"
              @click="$emit('jump', item - 1)"
      ><div style="min-width: 2rem">{{item}}</div></button>
      <button class="btn btn-sm btn-outline-primary"
              :disabled="sectionIndex >= (sectionCount - 1)"
              @click="$emit('jump', (section[section.length - 1] - 1) + 1)"
      >...</button>
    </div>
    <button class="btn btn-sm btn-outline-primary" :disabled="page === totalPage"
            @click="$emit('next')"
    >
      <i class="bi-caret-right-fill"></i>
    </button>
  </div>
  <div class="ps-2"><span>{{page + 1}}</span> / <span>{{totalPage}}</span></div>
</div>
</template>

<script>
export default {
  name: 'MSPagination',
  emits: ['next', 'prev', 'jump'],
  props: {
    pagination: {
      type: Object,
      default: () => ({
        page: 0,
        size: 0,
        totalPage: 0,
        hasNext: false,
        hasPrev: false,
      }),
    },
    shownPageCount: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {};
  },
  methods: {

  },
  mounted() {

  },
  computed: {
    page() {
      return this.pagination.page;
    },
    totalPage() {
      return this.pagination.totalPage || 0;
    },
    sectionIndex() {
      return parseInt(`${this.page / this.shownPageCount}`, 10);
    },
    sectionMaxPage() {
      return (this.sectionIndex + 1) * this.shownPageCount;
    },
    sectionMinPage() {
      return this.sectionMaxPage - (this.shownPageCount) + 1;
    },
    sectionCount() {
      let sections = parseInt(`${this.totalPage / this.shownPageCount}`, 10);
      if (this.totalPage % this.shownPageCount !== 0) sections++;
      return sections;
    },
    section() {
      const arr = [];
      for (let i = this.sectionMinPage; (i <= this.sectionMaxPage && i <= this.totalPage); i++) arr.push(i);
      return arr;
    },
  },
};
</script>

<style>
.ms-pagination {
  display: flex;
  align-items: center;
}
.ms-pagination-container {
  display: flex;
  align-items: center;
  flex-grow: 1;
}
</style>
