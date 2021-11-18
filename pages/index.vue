<template>
  <div class="">
    <section>
      <landing-hero></landing-hero>
    </section>
    <!-- TODO refactor codyhouse folding-3d-->

    <section>
      <landing-four></landing-four>
    </section>
    <section>
      <div class="bg-black py-12">
        <landing-contact></landing-contact>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  mounted() {
    fetch('https://of5309w9j4.execute-api.us-west-2.amazonaws.com/hello')
      .then((response) => response.json())
      .then((data) => console.log(data))
  },
  methods: {},
}
</script>

<style lang="scss" scoped></style>
