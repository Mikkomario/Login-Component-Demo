import Vue from 'vue'
import App from './App.vue'

import './../node_modules/bulma/css/bulma.css'
import VueResource from "vue-resource"

Vue.use(VueResource)

new Vue({
  el: '#app',
  render: h => h(App)
})
