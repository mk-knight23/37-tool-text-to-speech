import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'

// @ts-ignore - Vue SFC handles default export
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
