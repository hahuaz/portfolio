<template>
  <div class="cd-fold-content">
    <div class="four-page">
      <div class="four-page__content">
        <div class="my-12">
          <transition name="glide-up-fastest" appear>
            <h1 class="font-thin text-4xl text-center mb-12">Who Am I ?</h1>
          </transition>
          <transition name="glide-up-fast" appear>
            <div class="max-w-xl mx-auto">
              <p style="text-indent: 1rem" class="font-mono">
                I ask the question myself a lot by the way. I don’t like to
                define myself by the work I’ve done. I define myself by the work
                I want to do. Skills can be taught. I prefer to keep learning,
                continue challenging myself, and do interesting things that
                matter.
                <br />
                <br />
                I am passionate about what I do. I like to make things from
                scratch because it gives me the ability to manage everything on
                that thing. Thus, I can bring my ideas and wishes to life
                without any attachments.
                <br />
                <br />
                At 24, I mostly spend my time with coding. I am
                business-oriented and these days working a lot. The only
                limitations in my work are my skills and ideas, which encourages
                me to produce more.
              </p>
              <div class="py-12">
                <a
                  href="/hahuaz-resume.pdf"
                  class="text-gray-100 px-4 py-2 rounded-sm bg-black"
                  target="_blank"
                  >Portfolio</a
                >
              </div>
            </div>
          </transition>
        </div>
      </div>

      <div class="background--image"></div>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="scss" scoped>
.four-page {
  > .background--image {
    background-image: linear-gradient(rgba(gray, 0.5), rgba(gray, 0.5)),
      url('~/assets/image/pattern-circle.png');
    opacity: 0.1;
    background-repeat: repeat;
    background-size: auto;
    z-index: 1;
  }
}
</style>
