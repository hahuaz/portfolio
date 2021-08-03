<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content">
        <transition name="glide-up-fastest" appear>
          <h1 class="bottom__line--blue mb-12 mx-auto w-min lg:mt-12">
            Blog
          </h1>
        </transition>

        <div class="p-4">
          <transition name="glide-up-fast" appear>
            <div class="content max-w-screen-sm">
              <h1 class="text-xl font-semibold pb-2"
                >Authentication process in strapi</h1
              >
              <ul class="ml-4">
                <li
                  >First you need to put the wanted content type behind the user
                  and permission plugin.After that when you create user or login
                  using user and permission plugin it gives you jwt.</li
                >
                <li
                  >When you make request to the wanted content type you provide
                  authorization header. Strapi automatically sees that header
                  and add user to the ctx if jwt valid. So you can have user
                  under ctx.state.user
                </li>
                <li
                  >In conclusion you have user object in wanted content types
                  controller.</li
                >
                <li
                  >You can find the process under strapi
                  <span class="font-semibold"
                    >“create is owner policy”</span
                  ></li
                >
              </ul>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.content {
  h1 {
    &::before {
      content: '#';
      font-size: 2rem;
      color: rgb(3, 221, 3);
      position: relative;
      top: 5px;
      margin-right: 5px;
    }
  }
  > ul li {
    margin-left: 1rem;
    &::before {
      content: '-';
      font-weight: bold;
      margin-right: 6px;
    }
  }
}
</style>
