<template>
  <div class="contact bg-black py-12 text-gray-50">
    <div class="contact__header">
      <h1 class="left">Say Hello</h1>
      <span class="">or</span>
      <h1 class="right">Start a Project</h1>
    </div>
    <div
      class="
        contact__content
        grid grid-cols-2
        py-12
        justify-items-center
        items-center
      "
    >
      <div class="px-4">
        <div class="face--wrapper">
          <div class="face"></div>
        </div>
        <p class="presentation font-serif">
          I am <span>24</span>, located in İstanbul - Turkey. I am working as
          <span>freelancer</span> and currently availabe to contribute any
          project. Feedback, work, team-member? Feel free to
          <span>get in touch</span> by any means of communication.
        </p>
      </div>
      <div class="inputs grid grid-flow-row gap-y-4">
        <input
          v-model="email"
          type="text"
          placeholder="E-mail"
          class="rounded-lg py-2 px-3 text-black w-80 font-semibold"
        />
        <textarea
          id=""
          v-model="message"
          name=""
          placeholder="Message..."
          class="rounded-lg py-2 px-3 text-black"
        ></textarea>
        <div
          class="grid grid-flow-col auto-cols-min gap-x-4 items-center"
          style="height: 46px"
        >
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
    padding: 2rem 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 3rem 1fr;
    justify-items: center;
    overflow: hidden;
    span {
      font-size: 1.5rem;
      padding: 0 1rem 0.43rem;
      border-radius: 0.8rem;
      background-color: #464646;
      line-height: 1.7rem;
      align-self: center;
      justify-self: end;
      grid-row-start: 2;
    }
    .left,
    .right {
      font-size: 4rem;

      line-height: 4.3rem;
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
        width: 400%;
        height: 3px;
        top: -7px;
        right: 0;
      }
    }
    .right {
      grid-column-start: 2;
      grid-row-start: 3;
      &::after {
        content: '';
        position: absolute;
        background-color: white;
        width: 400%;
        height: 3px;
        bottom: -7px;
        left: 0;
      }
    }
  }
  &__content {
    .presentation {
      font-size: 1.3rem;
      word-spacing: 0.25rem;
      max-width: 650px;
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
      width: 224px;
      height: 224px;
      background-color: white;
      box-sizing: border-box;
      clip-path: circle(50% at 50% 50%);

      float: left;
      margin-right: 1.3rem;
      shape-outside: circle(50% at 50% 50%);

      .face {
        width: 220px;
        height: 220px;
        background-image: url('~/assets/image/face.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        clip-path: circle(50% at 50% 50%);
      }
    }
    .inputs {
      > * {
        &::placeholder {
          font-weight: 600;
        }
      }

      textarea {
        width: 500px;
        height: 160px;
      }
      button {
        background: linear-gradient(to top, #eaeaea, #dbdbdb, #f2f2f2, #ada996);
        transition: all 0.3s;
        &:hover {
          box-shadow: 0px 2px 10px white;
          transform: translateY(-3px);
        }
        &:active {
          box-shadow: 0px 2px 10px white;
          transform: translateY(-3px);
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
