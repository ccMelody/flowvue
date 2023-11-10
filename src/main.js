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
window.oaTemplateId = getUrlParam('templateId')
// window.ccBillType = 105
// window.ccAccountbookId ='2c91e3f686bee30b0186c4d58bea6f06'
// window.oaTemplateId = '2c91e302887ca4d80188806f6eec3bf0'
console.log("billtype",window.ccBillType,window.ccAccountbookId,'templateid',window.oaTemplateId)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
