<template>
<div style="display: flex; flex-flow: column;">
  <div class="ms-nav-item"
       style="display: flex; text-align: left; padding: 5px; margin-top: 1rem;"
       :class="[{'active' : navBarActivationKey === 'route_name:DefaultView'}]"
       @click="$router.push({ name: 'DefaultView' })"
  >
    <ms-image-view rounded background-color="gray" width="48px" height="48px" :src="userInfo.avatar">
      <template v-slot:empty-image>
        <div class="view-absolute" style="display: flex; justify-content: center; align-items: center">
          <i class="bi-person-fill" style="text-align: center; font-size: 24px"/>
        </div>
      </template>
    </ms-image-view>
    <div style="display: flex; flex-flow: column; justify-content: center; flex-grow: 1; padding-left: 1rem; overflow: hidden">
      <span style="font-size: larger; text-wrap: none;">{{ userInfo.nickname || userInfo.username }}</span>
      <span style="font-size: smaller; text-wrap: none; font-weight: bold">{{ userInfo.username }}</span>
    </div>
  </div>

  <template v-for="(item, index) in navBarSections" :key="index">
    <ms-nav-section-header v-if="item.type === 'section-header'"
                           :icon="item.icon" :title="item.title"
    />
    <ms-nav-section-item v-else-if="item.type === 'section-item'"
                         :icon="item.icon" :title="item.title"
                         @click="doItemAction(item)"
                         :class="[{'active' : navBarActivationKey === item.activeFlag}]"
    />
  </template>
</div>
</template>

<script>
import MSNavSectionHeader from '@/components/MSNavSectionHeader.vue';
import MSNavSectionItem from '@/components/MSNavSectionItem.vue';
import MSImageView from '@/components/MSImageView.vue';

import { mapGetters } from 'vuex';

export default {
  name: 'MainNavBar',
  components: {
    'ms-nav-section-header': MSNavSectionHeader,
    'ms-nav-section-item': MSNavSectionItem,
    'ms-image-view': MSImageView,
  },
  data() {
    return {

    };
  },
  methods: {
    doItemAction(item) {
      const { onClick } = item;
      if (!onClick || !(onClick instanceof Function)) return;
      onClick.bind(this)();
    },
  },
  computed: {
    ...mapGetters(['navBarSections', 'navBarActivationKey']),
    ...mapGetters('UserInfo', ['userInfo']),
  },
};
</script>

<style>

</style>
