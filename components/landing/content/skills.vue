<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content">
        <transition name="glide-up-fast" appear>
          <div>
            <div class="grid grid-cols-1 justify-items-center">
              <h1 class="bottom__line--blue mt-24 mb-6 inline-block">
                Languages
              </h1>
            </div>
            <div
              class="
                grid grid-cols-3
                gap-x-24 gap-y-24
                justify-items-center
                text-center
                bg-white
                py-6
                rounded-md
              "
            >
              <div>
                <img class="w-16 h-16" src="~/assets/image/js.png" alt="" />
                <p class="mt-6 font-semibold">Javascript</p>
              </div>
              <div>
                <img class="w-16 h-16" src="~/assets/image/html.png" alt="" />
                <p class="mt-6 font-semibold">HTML</p>
              </div>
              <div>
                <img class="w-16 h-16" src="~/assets/image/css.png" alt="" />
                <p class="mt-6 font-semibold">CSS</p>
              </div>
            </div>
          </div>
        </transition>
        <transition name="glide-up-normal" appear>
          <div>
            <div class="grid grid-cols-1 justify-items-center">
              <h1 class="bottom__line--blue mt-24 mb-6 inline-block">
                Structures
              </h1>
            </div>
            <div
              class="
                grid grid-cols-3
                gap-x-24 gap-y-24
                justify-items-center
                text-center
                bg-white
                py-6
                rounded-md
              "
            >
              <div>
                <img class="w-16 h-16" src="~/assets/image/nuxt.png" alt="" />
                <p class="mt-6 font-semibold">Nuxt</p>
              </div>
              <div>
                <img class="w-16 h-16" src="~/assets/image/vue.png" alt="" />
                <p class="mt-6 font-semibold">Vue</p>
              </div>
              <div>
                <img class="w-16 h-16" src="~/assets/image/nodejs.png" alt="" />
                <p class="mt-6 font-semibold">Nodejs</p>
              </div>
              <div>
                <img
                  class="w-16 h-16"
                  src="~/assets/image/mongodb.png"
                  alt=""
                />
                <p class="mt-6 font-semibold">Mongodb</p>
              </div>
              <div>
                <img class="w-16 h-16" src="~/assets/image/strapi.svg" alt="" />
                <p class="mt-6 font-semibold">Strapi</p>
              </div>
              <div>
                <img
                  class="w-16 h-16"
                  src="~/assets/image/tailwind.png"
                  alt=""
                />
                <p class="mt-6 font-semibold">Tailwind</p>
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
