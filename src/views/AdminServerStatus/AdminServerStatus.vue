<template>
  <router-view v-slot="{ Component }">
    <transition name="ani-right-dock" mode="out-in"
                @after-appear="(Component.postTransaction || (() => {}))()"
    >
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script>
export default {
  name: 'AdminServerStatus',
};
</script>

<style scoped>

</style>
