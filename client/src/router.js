import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
	routes: [
		{
			path: '/',
			name: 'root',
			component: () => import(/* webpackChunkName: "root" */ './views/Root.vue')
		},
		{
			path: '/login',
			name: 'login',
			component: () => import(/* webpackChunkName: "login" */ './views/Login.vue'),
			meta: {
				noAuth: true
			}
		}
	]
});

export default router;