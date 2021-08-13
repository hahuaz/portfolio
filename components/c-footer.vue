<template>
  <div
    class="
      grid grid-flow-row
      md:grid-flow-col
      gap-y-6
      justify-items-center
      items-center
      text-gray-100
      py-8
      px-2
    "
    style="background-color: #191919"
  >
    <div class="font-semibold uppercase text-xs md:text-base">
      © all rights reserved - hahuaz.com - 2021
    </div>
    <div class="links text-2xl flex gap-x-4 justify-center">
      <a href="https://github.com/hahuaz">
        <font-awesome-icon :icon="['fab', 'github']" />
      </a>
      <a href="mailto:work.hahuaz@email.com">
        <font-awesome-icon :icon="['far', 'envelope']" />
      </a>
      <a href="https://twitter.com/marjinalbiz">
        <font-awesome-icon :icon="['fab', 'twitter']" />
      </a>
      <a href="https://www.linkedin.com/in/hasan-biyik-51046a116/">
        <font-awesome-icon :icon="['fab', 'linkedin-in']" />
      </a>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.links {
  > a {
    border-radius: 0.5rem;
    padding: 0.3rem 0.8rem;
    background-color: #252424;

    &:hover > * {
      transition: all 200ms ease-in-out;
      transform: scale(1.2);
    }
  }
}
</style>
