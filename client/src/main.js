import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import metroUI from "metroui-vue"
import "metroui-vue/dist/metroui-vue.css"
Vue.use(metroUI);

import Vuelidate from "vuelidate";
Vue.use(Vuelidate)

Vue.config.productionTip = false

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')
