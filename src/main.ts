import './assets/main.css'
import { loadFonts } from './assets/font-loader'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

loadFonts()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
