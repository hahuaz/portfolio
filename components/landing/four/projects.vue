<template>
  <div
    class="projects w-full h-full grid content-center relative c-shadow--inset"
  >
    <h2 class="font-raleway mb-3">
      projects <span v-html="checkEntity"></span>
    </h2>
    <p class="font-comfortaa text-xl text-gray-50">made by two hands.</p>
    <b>View More</b>
    <div class="background--image"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checkEntity: '&#10004;',
    }
  },
}
</script>

<style lang="scss" scoped>
.projects {
  &:hover .background--image::before {
    background-color: rgba(black, 0.4);
  }
}

.background--image {
  background-image: url('~/assets/image/projects.jpg');

  &::before {
    position: absolute;
    content: '';
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    background-color: rgba(black, 0.5);
    transition: all 0.5s;
  }
}
</style>
