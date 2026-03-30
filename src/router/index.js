import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import D20View from '@/View/D20View.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/roll',
      name: 'roll',
      component: D20View,
    },
    {
      path: '/boss-tracker',
      name: 'BossTracker',
      component: () => import('@/views/BossTrackerView.vue'),
    },
  ],
})

export default router
