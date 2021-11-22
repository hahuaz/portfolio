<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content space-y-12 pb-8">
        <transition name="glide-up-fastest" appear>
          <h1 class="bottom__line--blue mb-12 mx-auto w-min lg:mt-12">
            Projects
          </h1>
        </transition>
        <transition name="glide-up-fast" appear>
          <div class="project">
            <div class="project__image">
              <img
                class="w-full h-full object-center object-cover"
                src="/images/palas-screenmockup.jpg"
                alt=""
              />

              <div class="project__links">
                <a
                  href="https://github.com/hahuaz/palas-frontend"
                  target="_blank"
                  class="git"
                >
                  <font-awesome-icon
                    class=""
                    :icon="['fab', 'github']"
                  ></font-awesome-icon>
                </a>
                <a
                  href="https://palas-realestate.netlify.app/"
                  target="_blank"
                  class="site"
                >
                  <font-awesome-icon
                    class=""
                    :icon="['fas', 'external-link-alt']"
                  ></font-awesome-icon>
                </a>
              </div>
            </div>

            <div class="project__content text-sm mt-4 space-y-2">
              <div class="flex gap-6 items-center">
                <h1 class="project__title">
                  <i>Palas Realestate</i>
                </h1>
                <div class="h-8 flex items-center gap-2">
                  <img src="/images/nuxt.png" class="w-6 h-6" alt="" />
                  <img src="/images/strapi.svg" class="w-5 h-5" alt="" />
                </div>
              </div>
              <p>Client can edit, add and delete properties via Strapi CMS. </p>
              <p
                >When new content added to CMS, Netlify deployment triggered
                automatically via webhooks.</p
              >
              <p
                >Uses Intersection Observer API for reveal and scroll
                transitions.
              </p>
            </div>
          </div>
        </transition>
        <transition name="glide-up-normal" appear>
          <div class="project">
            <div class="project__image">
              <img
                class="w-full h-full object-center object-cover"
                src="/images/forecast-screenmockup.jpg"
                alt=""
              />
              <div class="project__links">
                <a
                  href="https://github.com/hahuaz/forecast-frontend"
                  target="_blank"
                  class="git"
                >
                  <font-awesome-icon
                    class=""
                    :icon="['fab', 'github']"
                  ></font-awesome-icon>
                </a>
                <a
                  href="https://forecast-hahuaz.netlify.app/"
                  target="_blank"
                  class="site"
                >
                  <font-awesome-icon
                    class=""
                    :icon="['fas', 'external-link-alt']"
                  ></font-awesome-icon>
                </a>
              </div>
            </div>

            <div class="project__content text-sm mt-4 space-y-2">
              <div class="flex gap-6 items-center">
                <h1 class="project__title">
                  <i>Forecast App</i>
                </h1>
                <div class="h-8 flex items-center gap-2">
                  <img src="/images/rest-api.png" class="w-6 h-6" alt="" />
                </div>
              </div>
              <p
                >App makes use of
                <span class="font-semibold"> Mapbox </span> and
                <span class="font-semibold"> OpenWeatherMap </span> APIs.
              </p>
              <p>Using Vuetify as UI.</p>
            </div>
          </div>
        </transition>

        <div class="project">
          <div class="project__image">
            <img
              class="w-full h-full object-center object-cover"
              src="/images/besideme-screenmockup.jpg"
              alt=""
            />

            <div class="project__links">
              <a
                href="https://github.com/hahuaz/besideme-frontend"
                target="_blank"
                class="git"
              >
                <font-awesome-icon
                  class=""
                  :icon="['fab', 'github']"
                ></font-awesome-icon>
              </a>
              <a
                href="https://besideme-realestate.netlify.app/"
                target="_blank"
                class="site"
              >
                <font-awesome-icon
                  class=""
                  :icon="['fas', 'external-link-alt']"
                ></font-awesome-icon>
              </a>
            </div>
          </div>

          <div class="project__content text-sm mt-4 space-y-2">
            <div class="flex gap-6 items-center">
              <h1 class="project__title">
                <i>Besideme Realestate</i>
              </h1>
              <div class="h-8 flex items-center gap-2">
                <img src="/images/nuxt.png" class="w-6 h-6" alt="" />
                <img src="/images/jamstack.png" class="w-12 h-6" alt="" />
              </div>
            </div>
            <p>Created this project to sharpen my CSS skills. </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
.project {
  @apply bg-blue-50 p-12 rounded-2xl max-w-lg mx-auto;

  &__links {
    @apply absolute opacity-0 w-full bottom-0 p-2 bg-white z-10 text-2xl flex justify-end
gap-8 text-blue-dark;
    transition: all 500ms ease-in-out;
    transform-origin: right;

    a {
      visibility: hidden;
      opacity: 0;
      transform: translateX(50px);
    }

    .git {
      transition: all 300ms ease-in-out 100ms;
    }
    .site {
      transition: all 300ms ease-in-out 400ms;
    }
  }

  &__image {
    @apply max-w-sm h-[350px] mx-auto relative rounded-md overflow-hidden shadow-lg;

    &:hover .project__links {
      opacity: 1;
    }

    &:hover .git {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }

    &:hover .site {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }
  }
  &__content {
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
    > p {
      margin-left: 1rem;
      &::before {
        content: '-';
        font-weight: bold;
        margin-right: 6px;
      }
    }
  }
  &__title {
    @apply font-semibold text-2xl;
  }
}
</style>
