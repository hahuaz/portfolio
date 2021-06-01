<template>
  <div class="contact bg-black text-gray-50">
    <div
      class="
        contact__header
        text-2xl
        sm:text-4xl
        xl:text-6xl
        grid grid-rows-3 grid-cols-2
        justify-items-center
        gap-y-1
      "
    >
      <h1 class="left">Say Hello</h1>
      <span class="py-1 px-2 text-base lg:text-2xl">or</span>
      <h1 class="right">Start Project</h1>
    </div>
    <div
      class="
        contact__content
        grid grid-cols-1
        gap-y-12
        lg:grid-cols-2
        xl:py-12
        text-sm
        leading-relaxed
        justify-items-center
        items-center
        pb-12
      "
    >
      <div class="px-1 max-w-lg xl:max-w-xl">
        <div>
          <div class="face--wrapper mr-2 sm:mr-5">
            <div class="face"></div>
          </div>
          <p
            class="
              presentation
              font-serif
              text-gray-200 text-sm
              sm:text-base
              xl:text-lg
            "
          >
            I am <span>24</span>, located in İstanbul - Turkey. I am working as
            <span>freelancer</span> and currently availabe to contribute any
            project. Feedback, work, team-member? Feel free to
            <span>get in touch</span> by any means of communication.
          </p>
        </div>
      </div>
      <div class="inputs grid grid-flow-row gap-y-4 w-full max-w-lg px-4">
        <input
          v-model="email"
          type="text"
          placeholder="E-mail"
          class="rounded-lg py-2 px-3 text-black font-semibold max-w-xs"
        />
        <textarea
          id=""
          v-model="message"
          name=""
          placeholder="Message..."
          class="rounded-lg py-2 px-3 text-black h-28"
        ></textarea>
        <div
          class="
            grid grid-flow-col
            auto-cols-min
            gap-x-4
            items-center
            justify-end
          "
          style="height: 46px"
        >
          <transition name="fade">
            <div v-if="loading" class="">
              <div class="lds-ellipsis">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div
              v-if="status"
              class="
                whitespace-nowrap
                font-semibold
                text-green-500
                py-1
                px-4
                rounded-md
              "
              style="background-color: #464646"
              :class="{ 'text-red-500': errorOccured }"
            >
              {{ status }}
            </div>
          </transition>
          <button
            class="
              text-black text-xl
              rounded-md
              px-4
              py-1
              font-semibold
              w-min
              whitespace-nowrap
            "
            @click="sendMessage"
          >
            <font-awesome-icon :icon="['fas', 'paper-plane']" />
            Send
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: null,
      message: null,
      loading: false,
      status: false,
      errorOccured: false,
    }
  },
  async fetch() {},
  methods: {
    async sendMessage() {
      this.loading = true
      this.status = false
      this.errorOccured = false

      try {
        await this.$axios.$post(this.$config.strapiURL + '/messages', {
          email: this.email,
          message: this.message,
        })
        this.status = 'Message received.'
      } catch (error) {
        this.errorOccured = true
        this.status = `Error occured: "${error.response.statusText}"`
      }
      this.loading = false
    },
  },
}
</script>

<style lang="scss" scoped>
.contact {
  &__header {
    padding: 1.3rem 0; /* it's necessary for showing borders on overflow */
    overflow: hidden;
    @media (min-width: 768px) {
      padding: 2rem 0;
    }
    @media (min-width: 1024px) {
      padding: 3rem 0;
    }
    span {
      border-radius: 0.8rem;
      background-color: #464646;
      align-self: center;
      justify-self: end;
      grid-row-start: 2;
      transform: translateX(50%);
    }
    .left,
    .right {
      display: inline-block;
      position: relative;
      font-weight: bold;
      font-family: serif;
    }

    .left {
      &::before {
        content: '';
        position: absolute;
        background-color: white;
        width: 1000%;
        height: 1px;
        top: 0;
        right: 0;
        @media (min-width: 640px) {
          height: 3px;
        }
      }
    }
    .right {
      grid-column-start: 2;
      grid-row-start: 3;
      &::after {
        content: '';
        position: absolute;
        background-color: white;
        width: 1000%;
        height: 1px;
        bottom: 0;
        left: 0;
        @media (min-width: 640px) {
          height: 3px;
        }
      }
    }
  }
  &__content {
    .presentation {
      word-spacing: 0.25rem;
      span {
        background-color: #1e1e1e;
        padding: 0 0.6rem;
        border-radius: 0.6rem;
        display: inline-block;
      }
    }
    .face--wrapper {
      position: relative;
      padding: 2px;
      width: 154px;
      height: 154px;
      background-color: white;
      box-sizing: border-box;
      clip-path: circle(50% at 50% 50%);

      float: left;
      shape-outside: circle(50% at 50% 50%);

      @media (min-width: 1280px) {
        width: 224px;
        height: 224px;
      }
      .face {
        width: 150px;
        height: 150px;
        background-image: url('~/assets/image/face.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        clip-path: circle(50% at 50% 50%);

        @media (min-width: 1280px) {
          width: 220px;
          height: 220px;
        }
      }
    }
    .inputs {
      > * {
        &::placeholder {
          font-weight: 600;
        }
      }

      button {
        background: linear-gradient(to top, #eaeaea, #dbdbdb, #f2f2f2, #ada996);
        transition: all 0.3s;
        &:hover {
          box-shadow: 0px 2px 10px white;
        }
        &:active {
          box-shadow: 0px 2px 10px white;
        }
      }
    }
  }
}

/* loading animation */
.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 40px;
  height: 40px;
}
.lds-ellipsis div {
  position: absolute;
  top: 18px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fff;
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 4px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 4px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 16px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 28px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(12px, 0);
  }
}
</style>
