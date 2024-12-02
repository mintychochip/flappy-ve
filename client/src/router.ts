
import { createRouter, createWebHistory } from "vue-router";
import Menu from "./Menu.vue";
const routes = [
    {
        path: '/',
        name: 'Home',
        component: Menu,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;