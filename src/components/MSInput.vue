<template>
  <div class="ms-input" :class="classes" style="display: flex">
    <slot name="leading"></slot>
    <input :value="value" @input="this.value = $event.target.value"
           :type="inputType" :placeholder="placeholder" :size="size"
           style="flex-grow: 1; height: 100%" :style="inputStyle" :maxlength="maxLength"
    >
    <div class="input-decorator"></div>
    <slot name="tailing"></slot>
  </div>
</template>

<script>
export default {
  name: 'MSInput',
  props: ['modelValue', 'decorator', 'inputType', 'placeholder', 'inputAlignment', 'size', 'maxLength'],
  emits: ['update:modelValue'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    classes() {
      const classes = {};
      classes[`decorator-${this.decorator || 'underline'}`] = true;
      return classes;
    },
    inputStyle() {
      return {
        textAlign: this.inputAlignment || 'left',
      };
    },
  },
};
</script>

<style>
.ms-input {
  position: relative;
  display: flex;
  align-items: center;
}

.ms-input > input {
  border: none;
  background: transparent;
  min-width: 100px;
  outline: none;
}

.ms-input > input + div.input-decorator {
  position: absolute;
  top: 0;
  bottom: 0;
}

.ms-input.decorator-underline .input-decorator {
  border-bottom: transparent solid 1px;
  left: 50%;
  right: 50%;
  transition: all 0.5s;
}

.ms-input.decorator-underline > input:focus + .input-decorator {
  border-bottom-color: gray!important;
  left: 0;
  right: 0;
}

</style>
