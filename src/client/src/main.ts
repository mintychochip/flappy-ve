import App from "./App.vue";
import { createApp } from "vue";
import router from "./router";
import { socketService } from "./SocketService";
import './assets/index.css';

const app = createApp(App);
app.use(router);
app.provide("$socket", socketService);
app.mount("#app");
