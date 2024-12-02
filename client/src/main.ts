import App from "./App.vue";
import { createApp } from "vue";
import router from "./router";
import { socketService } from "./SocketService";
import {ElButton, ElInput, ElMessage} from 'element-plus';
import 'element-plus/dist/index.css';

const app = createApp(App);
app.use(router);
app.use(ElButton);
app.use(ElInput);
app.use(ElMessage);
app.provide("$socket", socketService);
app.mount("#app");
