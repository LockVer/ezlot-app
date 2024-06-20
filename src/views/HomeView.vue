<template>
  <div class="home">
    <!-- 显示安装提示和按钮仅当应用未安装且beforeinstallprompt事件触发 -->
    <div class="install-box" v-if="!isInstalled && showInstallPromotion">
      <img src="../assets/logo.png" alt="">
      <p>Install this app on your device for a better experience.</p>
      <div class="btns">
        <button @click="installPWA">Install the application</button>
        <button class="continue" @click="continueWithoutInstall">Continue</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  data() {
    return {
      deferredPrompt: null,
      showInstallPromotion: false,
      isInstalled: false,
    };
  },
  mounted() {
    console.log('HomeView mounted');
    window.addEventListener('beforeinstallprompt', (e) => {
      // 防止默认的安装提示，以便可以展示自定义的安装按钮
      console.log('beforeinstallprompt fired');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPromotion = true;
    });

    window.addEventListener('appinstalled', () => {
      // 监听PWA安装事件
      console.log('PWA was installed');
      this.isInstalled = true;
      this.showInstallPromotion = false;
    });

    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode');
      // 如果应用已经被安装并且以“standalone”模式运行
      this.isInstalled = true;
      this.$router.push('/login');
    }
  },
  methods: {
    installPWA() {
      // 显示安装对话框
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
            this.showInstallPromotion = false;
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          this.deferredPrompt = null;
        });
      }
    },
    continueWithoutInstall() {
      this.$router.push('/login');
    }
  }
};
</script>
<style lang="scss">
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-size: 1.5rem;

  .install-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;

    img {
      width: 100px;
      height: 100px;
      margin-bottom: 10vh;
    }

    p {
      text-align: center;
    }
    .btns{
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      margin-left: 10px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 5vh;

      &:hover {
        background-color: #0056b3;
      }
      &.continue {
        background-color: #6c757d;
        &:hover {
          background-color: #5a6268;
        }
      }
    }
  }
}
</style>