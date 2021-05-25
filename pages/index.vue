<template>
  <div class="">
    <main class="cd-main" :class="{ 'fold-is-open': isOpen }">
      <header>
        <h1 class="text-red-500">3D Folding Panel</h1>
      </header>

      <ul class="cd-gallery">
        <li class="cd-item" @click="openComponent('who')">
          <div class="text-white p-4">
            <h2>Title 1</h2>
            <p>Lorem ipsum dolor sit amet, consectetur.</p>
            <b>View More</b>
          </div>
        </li>

        <li class="cd-item">
          <a href="item-2.html">
            <div>
              <h2>Title 2</h2>
              <p>Lorem ipsum dolor sit amet, consectetur.</p>
              <b>View More</b>
            </div>
          </a>
        </li>

        <li class="cd-item">
          <a class="dark-text" href="item-3.html">
            <div>
              <h2>Title 3</h2>
              <p>Lorem ipsum dolor sit amet, consectetur.</p>
              <b>View More</b>
            </div>
          </a>
        </li>

        <li class="cd-item">
          <a href="item-4.html">
            <div>
              <h2>Title 4</h2>
              <p>Lorem ipsum dolor sit amet, consectetur.</p>
              <b>View More</b>
            </div>
          </a>
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

      <div class="cd-fold-content">
        <!-- content will be loaded using javascript -->

        <component
          :is="currentComponent"
          v-on-clickaway="closeComponent"
        ></component>
      </div>

      <a class="cd-close" href="#0"></a>
    </div>
    <!-- .cd-folding-panel -->
  </div>
</template>

<script>
import { mixin as clickaway } from 'vue-clickaway'
export default {
  mixins: [clickaway],
  data() {
    return {
      currentComponent: null,
      isOpen: false,
    }
  },

  mounted() {},
  methods: {
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

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
</style>
