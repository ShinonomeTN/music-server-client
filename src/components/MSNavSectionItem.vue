<template>
  <button @click="onClick" class="ms-nav-item" :class="[{ 'active' : isActive }]">
    <i v-if="icon" style="padding: 0.5rem 1rem 0.5rem 0" :class="[`bi-${icon}`]" />
    <span style="white-space: nowrap">{{ title }}</span>
  </button>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: 'title',
    },
    icon: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  name: 'MSNavSectionItem',
  methods: {
    onClick() {
      this.$emit('click');
    },
  },
};
</script>

<style>

</style>
