<template>
  <div class="who w-full h-full grid content-center relative c-shadow--inset">
    <h2 class="font-raleway mb-3">who am I ?</h2>
    <p class="font-comfortaa text-xl text-gray-50">not much to say.</p>
    <b>View More</b>
    <div class="background--image"></div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.who {
  &:hover .background--image::before {
    background-color: rgba(black, 0.3);
  }
}

.background--image {
  background-image: url('~/assets/image/profile.jpg');
  background-position: top;

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
    background-color: rgba(black, 0.4);
    transition: all 0.5s;
  }
}
</style>
