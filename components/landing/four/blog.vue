<template>
  <div class="blog w-full h-full grid content-center relative c-shadow--inset">
    <h2 class="font-raleway mb-3">blog</h2>
    <p class="font-comfortaa text-xl text-gray-50">sometimes I write, too.</p>
    <b>View More</b>
    <div class="background--image"></div>
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
.blog {
  &:hover .background--image::before {
    background-color: rgba(black, 0.4);
  }
}

.background--image {
  background-image: url('~/assets/image/blog.jpg');

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
