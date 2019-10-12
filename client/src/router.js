import Vue from 'vue'
import Router from 'vue-router'

import SocketService from "@/scripts/SocketService"

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

router.beforeEach((to, from, next) => {
	if (!SocketService.socket && to.path != "/login") {
		return next({
			path: "/login",
			replace: true
		});
	}
	
	next();
});

export default router;