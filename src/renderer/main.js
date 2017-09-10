import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

const baseURL = (process.env.NODE_ENV === 'development') ? 'http://localhost:8081/' : 'http://vapor-api.arnaldocapo.com:81/'
axios.defaults.baseURL = baseURL

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
