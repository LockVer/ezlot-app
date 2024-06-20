import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import i18n from './locales/i18n'
import router from './router'
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

Vue.use(Toast); // `options` 是可选的配置对象

Vue.config.productionTip = false


new Vue({
  router,
  i18n,
  render: h => h(App)
}).$mount('#app')
