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

  <nav-bar-section :section="navBarPublicSections" />

  <nav-bar-playlist-section/>

  <nav-bar-section :section="navBarAdministrationSections" />
</div>
</template>

<script>
import MSImageView from '@/components/MSImageView.vue';
import NavBarSection from '@/views/NavBar/NavBarSection.vue';
import NavBarPlaylistSection from '@/views/NavBar/NavBarPlaylistSection.vue';

import { mapGetters } from 'vuex';

export default {
  name: 'MainNavBar',
  components: {
    'ms-image-view': MSImageView,
    NavBarSection,
    NavBarPlaylistSection,
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
    ...mapGetters(['navBarPublicSections', 'navBarAdministrationSections', 'navBarActivationKey']),
    ...mapGetters('UserInfo', ['userInfo']),
  },
};
</script>

<style>

</style>
