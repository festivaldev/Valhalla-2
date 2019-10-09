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

router.beforeEach(async (to, from, next) => {
	if (!window.socket && to.path !== "/login") {
		return next({
			path: "/login",
			replace: true
		});
	}
	
	next();
});

export default router;