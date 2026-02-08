import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import './style.css'

// @ts-ignore - Vue SFC handles default export
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)

app.config.errorHandler = (err, instance, info) => {
    console.error('Global VoiceFlow Error:', err, instance, info);
}

app.mount('#app')
