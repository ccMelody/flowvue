import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import FormControls from './components/FormControls/index.js'
import '@/assets/style/index.styl'
import axios from './axios';
import VueAxios from 'vue-axios';
import VueCookie from 'vue-cookie'

Vue.use( FormControls )
Vue.use(ElementUI);
Vue.use(VueAxios, axios);
Vue.use(VueCookie)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
