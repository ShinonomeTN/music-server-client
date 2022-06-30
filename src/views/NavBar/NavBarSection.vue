<template>
  <template v-for="(item, index) in section" :key="index">
    <ms-nav-section-header v-if="item.type === 'section-header'"
                           :icon="item.icon" :title="item.title"
    />
    <ms-nav-section-item v-else-if="item.type === 'section-item'"
                         :icon="item.icon" :title="item.title"
                         @click="doItemAction(item)"
                         :class="[{'active' : navBarActivationKey === item.activeFlag}]"
    />
  </template>
</template>

<script>
import { mapGetters } from 'vuex';
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import MSNavSectionItem from '@/components/MSNavSectionItem.vue';

export default {
  name: 'NavBarSection',
  components: {
    'ms-nav-section-header': MSNavSectionHeader,
    'ms-nav-section-item': MSNavSectionItem,
  },
  props: ['section'],
  computed: mapGetters(['navBarActivationKey']),
  methods: {
    doItemAction(item) {
      const { onClick } = item;
      if (!onClick || !(onClick instanceof Function)) return;
      onClick.bind(this)();
    },
  }
};
</script>

<style scoped>

</style>
