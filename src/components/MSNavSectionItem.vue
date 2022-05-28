<template>
  <button @click="onClick" class="ms-nav-item" :class="[{ 'active' : isActive }]">
    <i style="padding: 0.5rem 1rem 0.5rem 0" :class="[`bi-${icon}`]" />
    <span style="font-size: small">{{ title }}</span>
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
/*.ms-nav-item * {*/
/*  cursor: pointer;*/
/*}*/

.ms-nav-item {
  display: flex;
  align-items: center;
  padding-left: 1rem;
  margin: 0 5pt;
  border: none;
  cursor: pointer;
  outline: none;
  overflow: hidden;
  background: none;
  font-weight: bold;
  border-radius: 5px;
}

.ms-nav-item.active {
  color: white;
  background-color: var(--ms-button-active-bg-color);
}
.ms-nav-item.active:hover {
  background: var(--ms-button-active-heightlight-bg-color);
}
.ms-nav-item:hover {
  background: var(--ms-button-heightlight-bg-color);
}
</style>
