<template>
  <div>
    <div class="w-full h-screen grid justify-center content-center relative">
      <div class="text-gray-50 text-center text-4xl">
        <h1 class="text-6xl mb-6 font-comfortaa">hasan bıyık</h1>
        <div class="h-12 mb-6">
          <vue-typer
            id="custom-typer"
            erase-style="clear"
            :text="['front-end', 'full-stack', 'e-commerce']"
            :erase-on-complete="false"
          ></vue-typer>
        </div>
        <div
          style="color: #828283"
          class="links text-base flex gap-x-4 justify-center"
        >
          <a href="https://github.com/hahuaz">
            <font-awesome-icon :icon="['fab', 'github']" />
          </a>
          <a href="mailto:work.hahuaz@email.com">
            <font-awesome-icon :icon="['far', 'envelope']" />
          </a>
          <a href="https://twitter.com/marjinalbiz">
            <font-awesome-icon :icon="['fab', 'twitter']" />
          </a>

          <a href="https://www.instagram.com/hasan.hseyin/">
            <font-awesome-icon :icon="['fab', 'instagram']" />
          </a>
          <a href="https://www.linkedin.com/in/hasan-biyik-51046a116/">
            <font-awesome-icon :icon="['fab', 'linkedin-in']" />
          </a>
        </div>
      </div>
      <div
        v-scroll-to="'.cd-gallery'"
        class="icon-scroll mb-4 hidden md:block"
      ></div>
    </div>
    <div class="background--image"></div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
#custom-typer {
  ::v-deep .custom.char.typed {
    color: white;
    font-weight: bolder;
    font-family: raleway, sans-serif;
  }
  ::v-deep .custom.char.selected {
    color: transparent;
    background-color: transparent;
  }
  ::v-deep .custom.caret {
    visibility: hidden;
  }
}

.icon-scroll,
.icon-scroll:before {
  position: absolute;
  left: 50%;
}
.icon-scroll {
  width: 30px;
  height: 50px;
  margin-left: -20px;
  bottom: 10px;
  margin-top: -35px;
  border: 2px solid #fff;
  border-radius: 25px;
}
@media (max-width: 767px) {
  .icon-scroll {
    position: relative;
  }
}
.icon-scroll:before {
  content: '';
  width: 8px;
  height: 8px;
  background: #fff;
  margin-left: -4px;
  top: 8px;
  border-radius: 4px;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-name: scroll;
}
@keyframes scroll {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(26px);
  }
}

.background--image {
  background-image: linear-gradient(rgba(black, 0.68), rgba(black, 0.68)),
    url('~/assets/image/landing-hero.jpg');
}
</style>
