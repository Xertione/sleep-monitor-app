import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import store from './store'
import themeMixin from './utils/themeMixin'

Vue.config.productionTip = false
App.mpType = 'app'

Vue.mixin(themeMixin)

const app = new Vue({
  store,
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import store from './store'
import themeMixin from './utils/themeMixin'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  app.mixin(themeMixin)
  return {
    app
  }
}
// #endif