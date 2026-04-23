import 'bootstrap/dist/css/bootstrap.min.css'
import '@/assets/styles/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router/index.js'
import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
// Router registrado após Pinia porque os guards de rota
// usam o authStore — que depende do Pinia estar ativo
app.use(router)

app.mount('#app')