// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import 'reset-css'
import './assets/less/common.less'
import axios from 'axios'

Vue.config.productionTip = false

Vue.use(ElementUI)
// Add a response interceptor
axios.interceptors.response.use(function (response) {
  return response
}, function ({response}) {
  if (response.status === 401) {
    window.location.href = '/authPage/login'
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
