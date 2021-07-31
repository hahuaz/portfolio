<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content space-y-8 pb-8">
        <transition name="glide-up-fastest" appear>
          <h1 class="bottom__line--blue mb-12 mx-auto w-min lg:mt-12">
            Projects
          </h1>
        </transition>
        <transition name="glide-up-fast" appear>
          <div class="project bg-blue-50 p-12 rounded-2xl max-w-lg mx-auto">
            <a
              href="https://hahuaz-realestate-nuxt.herokuapp.com/"
              target="_blank"
              class="
                justify-self-center
                relative
                block
                max-w-sm
                h-80
                mx-auto
                rounded-lg
                overflow-hidden
              "
            >
              <div
                class="
                  project--image
                  w-full
                  h-full
                  grid
                  items-end
                  justify-items-center
                "
              >
                <span class="mb-4 font-semibold">Go to site</span>

                <div class="background--image realestate"></div>
              </div>
            </a>
            <div class="project--content text-sm mt-4 space-y-2">
              <h1 class="project--title font-semibold text-lg">
                <i>Realestate Project</i>
              </h1>
              <p>Uses Nuxt as view model.</p>
              <p>Uses Strapi for managing contents on site.</p>
              <p
                >Uses Intersection Observer API for reveal and scroll
                transitions
              </p>
            </div>
          </div>
        </transition>
        <transition name="glide-up-normal" appear>
          <div class="project bg-blue-50 p-12 rounded-2xl max-w-lg mx-auto">
            <a
              href="https://hahuaz-forecast.herokuapp.com/"
              target="_blank"
              class="
                justify-self-center
                relative
                block
                max-w-sm
                h-80
                mx-auto
                rounded-lg
                overflow-hidden
              "
            >
              <div
                class="
                  project--image
                  w-full
                  h-full
                  grid
                  items-end
                  justify-items-center
                "
              >
                <span class="mb-4 font-semibold">Go to site</span>

                <div class="background--image forecast-app"></div>
              </div>
            </a>
            <div class="project--content text-sm mt-4 space-y-2">
              <h1 class="project--title font-semibold text-lg">
                <i>Forecast App</i>
              </h1>
              <p
                >My first rest API which makes use of
                <span class="font-semibold"> Mapbox </span> and
                <span class="font-semibold"> Darksky. </span>
              </p>
              <p>Uses Handlebars template.</p>
            </div>
          </div>
        </transition>
      </div>
      <div class="background--image"></div>
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
  &--image {
    &:hover {
      span {
        opacity: 1;
        transform: translateY(0);
      }
      .background--image::before {
        opacity: 0.4;
      }
    }

    span {
      color: rgb(1, 1, 150);
      z-index: 2;
      opacity: 0;
      transform: translateY(1rem);
      transition: all 0.3s;

      &::after {
        content: '\2794';
      }
    }

    .background--image {
      z-index: 1;
      background-size: cover;

      &::before {
        content: '';
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        position: absolute;

        background-image: linear-gradient(to top, black, transparent 50%);
        opacity: 0;
        transition: all 0.3s;
      }
    }
    .realestate {
      background-image: url('~/assets/image/realestate-screen-mockup.png');
    }
    .forecast-app {
      background-image: url('~/assets/image/forecast-app.jpg');
    }
  }
  &--content {
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
}
</style>
