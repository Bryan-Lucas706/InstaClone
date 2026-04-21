import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)

// Pinia deve ser registrado antes do mount para que os stores
// estejam disponíveis desde o primeiro ciclo de vida dos componentes
app.use(createPinia())

app.mount('#app')