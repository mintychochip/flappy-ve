
import { createRouter, createWebHistory } from "vue-router";
import Game from './Game.vue'
import Home from "./Home.vue";
import Create from "./Create.vue";
import Join from "./Join.vue";
import Lobby from "./Lobby.vue";
import OnlineMenu from "./OnlineMenu.vue";
import { RouteLocationNormalized } from "vue-router";
import { RouteLocation } from "vue-router";
import { RouteLocationNormalizedLoaded } from "vue-router";
import { NavigationGuardNext } from "vue-router";
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/create',
        name: 'Create',   
        component: Create,
    },
    {
        path: '/game',
        name: 'Game',   
        component: Game,
        beforeEnter: (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
            const sessionId = sessionStorage.getItem('sessionId');
            const playerId = sessionStorage.getItem('playerId');

            if(!sessionId || !playerId) {
                next('/');
            } else {
                next();
            }
        }
    },
    {
        path: '/join',
        name: 'Join',   
        component: Join,
    },
    {
        path: '/lobby/:sessionId',
        component: Lobby,
    },
    {
        path: '/online',
        name: 'Online Menu',
        component: OnlineMenu,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});
export default router;