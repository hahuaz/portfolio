<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content">
        <transition name="glide-up-fast" appear>
          <div>
            <div class="grid grid-cols-1 justify-items-center">
              <h1 class="bottom__line--blue mt-24 mb-6 inline-block">
                Stack
              </h1>
            </div>
            <div
              class="
                grid grid-cols-3
                gap-x-24 gap-y-24
                justify-items-center
                text-center
                py-6
                rounded-md
              "
            >
              <div>
                <img class="w-16 h-16" src="/js.jpg" alt="" />
                <p class="mt-6 font-semibold">Javascript</p>
              </div>

              <div>
                <img class="w-16 h-16" src="/nuxt.png" alt="" />
                <p class="mt-6 font-semibold">Nuxt</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/vue.png" alt="" />
                <p class="mt-6 font-semibold">Vue</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/nodejs.png" alt="" />
                <p class="mt-6 font-semibold">Nodejs</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/mongodb.png" alt="" />
                <p class="mt-6 font-semibold">Mongodb</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/strapi.svg" alt="" />
                <p class="mt-6 font-semibold">Strapi</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/git.png" alt="" />
                <p class="mt-6 font-semibold">Git</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/tailwind.png" alt="" />
                <p class="mt-6 font-semibold">Tailwind</p>
              </div>
              <div>
                <img class="w-16 h-16" src="/sass.png" alt="" />
                <p class="mt-6 font-semibold">Scss</p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped></style>
