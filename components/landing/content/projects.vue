<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content">
        <transition name="glide-up-fastest" appear>
          <h1 class="bottom__line--blue mb-12 mx-auto w-min lg:mt-12">
            Projects
          </h1>
        </transition>
        <!-- TODO: add forecast api to projects -->
        <!-- content: first rest API which make use of mapbox and darksky to get forecast -->
        <transition name="glide-up-fast" appear>
          <div class="project bg-blue-50 p-12 rounded-2xl max-w-lg mx-auto">
            <a
              href="https://hahuaz-realestate-nuxt.herokuapp.com/"
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
                <span class="mb-4 font-semibold">Go to site </span>

                <div class="background--image"></div>
              </div>
            </a>
            <div class="project--content text-sm mt-4 space-y-2">
              <h1 class="project--title font-semibold text-lg">
                <i>Realestate Project</i>
              </h1>
              <p>Uses Nuxt as view model.</p>
              <p>Uses Strapi for managing contents on site.</p>
              <p>
                Uses Intersection Observer API for reveal and scroll transitions
              </p>
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
      background-image: url('~/assets/image/realestate-screen-mockup.png');
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
