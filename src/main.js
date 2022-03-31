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

function getUrlParam(name){
  var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
  var r = window.location.search.substr(1).match(reg);
  if (r!=null) return unescape(r[2]); return null;
}

window.ccBillType = getUrlParam('billType')
window.ccAccountbookId = getUrlParam('accountbookId')
console.log("billtype",window.ccBillType,window.ccAccountbookId)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
