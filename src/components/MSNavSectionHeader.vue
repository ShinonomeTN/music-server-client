<template>
  <div class="ms-nav-section">
    <slot v-if="icon" name="icon">
      <i :class="[`bi-${icon}`]"></i>
    </slot>
    <span class="ps-2" style="white-space: nowrap">{{ title }}</span>
    <hr style="flex-grow: 1"/>
  </div>
</template>

<script>
export default {
  name: 'MSNavSectionHeader',
  props: {
    icon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: 'title',
    },
  },
};
</script>

<style>
.ms-nav-section {
  display: flex;
  align-items: center;
}
</style>
