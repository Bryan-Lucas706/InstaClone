import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/styles/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())

// Router será registrado no Módulo 2.
// Por ora o app sobe sem erros de rota.

app.mount('#app')