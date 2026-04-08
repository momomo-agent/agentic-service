import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/status' },
    { path: '/status', component: () => import('./views/StatusView.vue') },
    { path: '/models', component: () => import('./views/ModelsView.vue') },
    { path: '/config', component: () => import('./views/ConfigView.vue') },
    { path: '/test', component: () => import('./views/TestView.vue') },
  ]
})

createApp(App).use(router).mount('#app')
