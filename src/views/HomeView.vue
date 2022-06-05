<template>
  <div class="view-fixed" style="display: flex;">
    <div class="main-navbar ms-safe-area-margin">
      <main-nav-bar/>
      <div style="flex-grow: 1"></div>
      <player-view />
    </div>
    <div class="main-content ms-safe-area-margin"
         :class="[{'child-require-flex': childRequireFlex},
                  {'child-require-scroll-y': childRequireScrollY},
                  {'child-require-relative': childRequireRelative}]"
    >
      <router-view v-slot="{ Component }">
        <transition name="ani-right-dock" mode="out-in"
                    @after-appear="(Component.postTransaction || (() => {}))()"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script>
import MainNavBar from '@/views/MainNavBar.vue';
import { mapActions, mapGetters } from 'vuex';
import PlayerView from '@/views/Player/PlayerView.vue';

export default {
  name: 'HomeView',
  components: {
    MainNavBar,
    PlayerView,
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      await Promise.all([
        this.configureNavBar(),
        this.updateServerInfo(),
      ]);
      this.$store.commit('setTitle', this.serverInfo.name || this.serverInfo.host);
      this.$store.commit('setShowTitleBar', true);
    },
    ...mapActions(['configureNavBar']),
    ...mapActions('ServerInfo', ['updateServerInfo']),
  },
  computed: {
    windowTitle() {
      return this.serverInfo.host || this.serverInfo.name;
    },
    childRequireFlex() {
      return this.$route.meta.requireFlex;
    },
    childRequireScrollY() {
      return this.$route.meta.requireScrollY;
    },
    childRequireRelative() {
      return this.$route.meta.requireRelative;
    },
    ...mapGetters('ServerInfo', ['serverInfo']),
  },
};
</script>

<style scoped>

@media screen and (min-width: 900px) {
  .main-navbar {
    min-width: 300px;
  }
}

@media screen and (max-width: 900px) {
  .main-navbar {
    min-width: 200px;
  }
}

.main-navbar {
  height: inherit;
  transition: width 0.3s;
  overflow: hidden;
  overflow-y: scroll;
  display: flex;
  flex-flow: column;
}

.main-content {
  flex-grow: 1;
  overflow: hidden;
  /*overflow-y: scroll;*/
}

.main-content.child-require-scroll-y {
  overflow-y: scroll;
}
.main-content.child-require-flex {
  display: flex;
}
.main-content.child-require-relative {
  position: relative;
}
</style>
