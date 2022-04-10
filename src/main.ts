import { createApp } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import Button from "primevue/button";
import Menubar from "primevue/menubar";

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./assets/main.css";

const app = createApp(App);

app.use(PrimeVue);
app.component("Card", Card);
app.component("Button", Button);
app.component("Menubar", Menubar);
app.mount("#app");
