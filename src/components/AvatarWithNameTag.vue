<template>
<div class="avatar-with-name-tag" :class="{disabled:disabled}" @click="onTagClick"
>
  <ms-image-view :src="image" border-radius="4px" width="20px" height="20px" class="ms-1">
    <template v-slot:empty-image>
      <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
        <i class="bi-person-fill" />
      </div>
    </template>
  </ms-image-view>
  <div class="ms-2 me-2" style="flex-grow: 1">{{ title }}</div>
  <button class="btn-close"
          style="margin: 5px; width: 5px; height: 5px; outline: none"
          tabindex="-1"
          @click="onCloseClick" :disabled="disabled"
  />
</div>
</template>

<script>
import MSImageView from '@/components/MSImageView.vue';

export default {
  name: 'ArtistAvatarWithNameTag',
  emits: ['close', 'click'],
  components: {
    'ms-image-view': MSImageView,
  },
  props: {
    title: String,
    image: {
      type: String,
      default: null,
    },
    disabled: Boolean,
  },
  mounted() {

  },
  methods: {
    onCloseClick() {
      this.$emit('close');
    },
    onTagClick() {
      this.$emit('click');
    },
  },
};
</script>

<style>

.avatar-with-name-tag {
  display: inline-flex;
  align-items: center;
  background-color: white;
  border-radius: 4px;
  border: whitesmoke solid 2px;
  cursor: pointer;
  position: relative;
  font-size: smaller;
  font-weight: bold;
  user-select: none;
  padding-left: 2px;
  padding-right: 2px;
}

.avatar-with-name-tag.bg-success {
  color: white
}

.avatar-with-name-tag.bg-danger {
  color: white
}

.avatar-with-name-tag.bg-secondary {
  color: white
}

.avatar-with-name-tag::before:hover {
  background-color: #DDD;
}

.avatar-with-name-tag.disabled {
  color: gray;
}

</style>
