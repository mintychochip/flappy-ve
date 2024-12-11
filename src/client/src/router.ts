
import { createRouter, createWebHistory } from "vue-router";
import { RouteLocationNormalized } from "vue-router";
import { NavigationGuardNext } from "vue-router";
import Login from "./Login.vue";

import Dashboard from './Dashboard.vue'
import Lobby from "./Lobby.vue";
import Game from "./Game.vue";
import GameWinner from "./GameWinner.vue";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: Dashboard,
        beforeEnter: hasToken
    },
    {
        path: '/session',
        name: 'Lobby',
        component: Lobby,
        beforeEnter: hasToken
    },
    {
        path: '/game',
        name: 'Game',   
        component: Game,
        beforeEnter: hasToken
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },
    {
        path: '/game/winner',
        name: 'game-winner',
        component: GameWinner
    }
];
async function hasToken(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
    const token = localStorage.getItem('token');
            if(!token || !(await checkToken(token))) {
                next('/login');
            } else {
                next();
            }
}
async function checkToken(token:string): Promise<boolean> {
     const response = await fetch(`${VITE_API_BASE_URL}/api/users/verify`, {
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
const router = createRouter({
    history: createWebHistory(),
    routes
});
export default router;