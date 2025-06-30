const routes = [
    {
      path: '/mapmaker',
      name: 'mapmaker',
      component: () => import('./mapMaker.layout.vue')
    }
]

export function useMapMaker() {
    return { routes }
}
