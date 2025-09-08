import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../home/HomeView.vue'
import { useMapMaker } from '../mapmaker/pages'
import { useSpriteEditor } from '../spriteEditor/pages'
import TestView from '../experiments/TestView.vue'

const mapMaker = useMapMaker()

const router = createRouter({
  history: { ...createWebHistory('/'),  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/test',
      name: 'test',
      component: TestView,
    },
    ...mapMaker.routes,
    ...useSpriteEditor().routes
  ],
})

export default router
