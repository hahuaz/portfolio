<template>
  <div class="bg-black">
    <!-- this background will effect the folding triangle that appear on top and bottom-->
    <main class="cd-main" :class="{ 'fold-is-open': isOpen }">
      <ul class="cd-gallery text-white" @click="scrollToTop">
        <li class="cd-item" @click="openComponent('landing-content-who')">
          <landing-four-who></landing-four-who>
        </li>
        <li class="cd-item" @click="openComponent('landing-content-skills')">
          <landing-four-skills></landing-four-skills>
        </li>
        <li class="cd-item" @click="openComponent('landing-content-projects')">
          <landing-four-projects></landing-four-projects>
        </li>
        <li class="cd-item" @click="openComponent('landing-content-blog')">
          <landing-four-blog></landing-four-blog>
        </li>
      </ul>
      <!-- .cd-gallery -->
    </main>
    <!-- .cd-main -->

    <div class="cd-folding-panel" :class="{ 'is-open': isOpen }">
      <div class="fold-left"></div>
      <!-- this is the left fold -->

      <div class="fold-right"></div>
      <!-- this is the right fold -->

      <!-- content will be loaded using javascript -->
      <!-- TODO every component needs cd-fold-content. remove that necessity. -->
      <component
        :is="currentComponent"
        v-on-clickaway="closeComponent"
      ></component>
      <span class="cd-close" href="#"></span>
    </div>
    <!-- .cd-folding-panel -->
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
import { scrollTo } from 'vue-scrollto'
export default {
  mixins: [clickaway],
  data() {
    return {
      currentComponent: null,
      isOpen: false,
    }
  },

  methods: {
    scrollToTop() {
      if (document.documentElement.clientWidth > 768) {
        scrollTo('.cd-gallery')
      }
    },

    openComponent(payload) {
      // you can add this classes with settime if component fetching is long or you can prefetch componenet with nuxt
      this.currentComponent = payload
      this.isOpen = true
      document.querySelector('body').classList.add('overflow-hidden')
    },
    closeComponent() {
      this.currentComponent = null
      this.isOpen = false
      document.querySelector('body').classList.remove('overflow-hidden')
    },
  },
}
</script>

<style></style>
