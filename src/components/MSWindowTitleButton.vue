<template>
<button class="ms-window-title-button">
  <i v-if="icon" :class="[`bi-${icon}`]"></i>
  <span class="ps-2" :class="[{'visually-hidden': !title}]">{{ title || 'b' }}</span>
</button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
  },
  name: 'MSWindowTitleButton',
};
</script>

<style>
.ms-window-title-button {
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  margin: auto 5pt;
  height: var(--ms-title-inset, 0) / 2;
  padding: 2px 7px 2px 7px;
  border: none;
  cursor: pointer;
  outline: none;
  overflow: hidden;
  background: none;
  font-weight: bold;
  border-radius: 4px;
}

.ms-window-title-button > i {
  position: relative;
  top: 2px;
}

.ms-window-title-button:hover {
  background-color: var(--ms-button-heightlight-bg-color);
}

.ms-window-title-button:active {
  background-color: var(--ms-button-press-bg-color);
}
</style>
