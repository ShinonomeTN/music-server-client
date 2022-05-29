<template>
  <div class="ms-nav-section">
    <slot v-if="icon" name="icon">
      <i :class="[`bi-${icon}`]"></i>
    </slot>
    <span class="ps-2">{{ title }}</span>
    <hr/>
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

</style>
