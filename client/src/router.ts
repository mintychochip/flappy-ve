
import { createRouter, createWebHistory } from "vue-router";
import Game from './Game.vue'
import { RouteLocationNormalized } from "vue-router";
import { NavigationGuardNext } from "vue-router";
import Login from "./Login.vue";

import Dashboard from './Dashboard.vue'

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
async function checkToken(token:string): Promise<boolean> {
     const response = await fetch(`${VITE_API_BASE_URL}/api/verify-token`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type" : "application/json"
        }
     });
     if(!response.ok) {
        const err = await response.json();
        console.error(err);
        return false;
     }
     return true;
}
const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
            const token = localStorage.getItem('token');
            if(!token || !(await checkToken(token))) {
                next('/login');
            } else {
                next();
            }
        }
    },
    {
        path: '/game',
        name: 'Game',   
        component: Game,
        beforeEnter: async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
            const token = localStorage.getItem('token');
            if(!token || !(await checkToken(token))) {
                next('/login');
            } else {
                next();
            }
        }
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});
export default router;