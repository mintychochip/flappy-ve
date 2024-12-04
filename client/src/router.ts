
import { createRouter, createWebHistory } from "vue-router";
import Game from './Game.vue'
import Home from "./Home.vue";
import Create from "./Create.vue";
import Join from "./Join.vue";
import OnlineMenu from "./OnlineMenu.vue";

const route = [{
    path: '/',
    name: 'Home',
    component: Home,
}];
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
    },
    {
        path: '/join',
        name: 'Join',   
        component: Join,
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