<template>
  <div class="ms-tag-input">
    <ms-input type="text" :placeholder="placeholder" style="flex-grow: 1; height: 100%" @keydown="onInputKeyDown" v-model="inputText">
      <template v-slot:leading>
        <div class="tag-list" :class="tagListClasses">
          <transition-group name="ani-switch">
            <slot name="tagList" v-for="(item, index) in tagObjectList" :key="index" :item="item">
              <div class="tag">
                <span>{{item}}</span>
              </div>
            </slot>
          </transition-group>
        </div>
      </template>
      <template v-slot:tailing>
        <slot name="tailing"></slot>
      </template>
    </ms-input>
  </div>
</template>

<script>
import MSInput from '@/components/MSInput.vue';

export default {
  name: 'MSTagInput',
  components: {
    'ms-input': MSInput,
  },
  props: {
    tagProvider: Function,
    tagObjectList: {
      type: Array,
      default: () => ([]),
    },
    placeholder: String,
  },
  emits: ['submit', 'delete'],
  data() {
    return {
      autoCompleteToken: '',
      inputText: null,
    };
  },
  methods: {
    getElements() {
      const childrenSnapshot = [];
      for (const child of this.$refs.editor.childNodes) childrenSnapshot.push(child);
      return childrenSnapshot;
    },
    onInputKeyDown(event) {
      const key = event.key.toLowerCase();
      switch (key) {
        case 'enter':
          this.$emit('submit', this.inputText);
          this.inputText = null;
          break;
        case 'backspace':
          this.onPreformDelete();
          break;
        default:
          break;
      }
    },
    onPreformDelete() {
      if (this.inputText) return;
      this.$emit('delete');
    },
  },
  computed: {
    tagListClasses() {
      return {
        empty: !(this.tagObjectList) || (this.tagObjectList.isEmpty()),
      };
    },
  },
};
</script>

<style>
.ms-tag-input {
  position: relative;
  display: flex;
  align-items: center;
}

.ms-tag-input .tag-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: scroll;
  overflow-y: hidden;
  max-width: 80%;
  padding: 2px 0;
}

.ms-tag-input .tag-list.empty {

}

.ms-tag-input .tag-list > div:not(:first-child) {
  margin-left: 2px;
}

.ms-tag-input .tag {
  background: whitesmoke;
  border: lightgray solid 1px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  min-width: 50px;
  white-space: nowrap;
}

.ms-tag-input-autocomplete {
  position: absolute;
}
</style>
