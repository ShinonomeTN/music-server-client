<template>
  <div class="ms-nav-section">
    <slot name="icon">
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
.ms-nav-section {
  color: var(--bs-secondary);
  display: flex;
  padding: 0.5rem 1rem;
  align-items: center;
  font-size: small;
}

.ms-nav-section > hr {
  color: var(--bs-secondary);
  display: inline-block;
  flex-grow: 1;
  margin: 0 0 0 1rem;
}
</style>
