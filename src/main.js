import { createApp } from "vue";
import App from "./App.vue";
import { Button, Upload, Spin } from "ant-design-vue";
import "ant-design-vue/dist/antd.css";

const app = createApp(App);
app.use(Button).use(Upload).use(Spin).mount("#app");
