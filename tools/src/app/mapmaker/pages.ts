const routes = [
    {
        path: '/mapmaker',
        name: 'mapmaker',
    component: () => import('./mapMaker.layout.vue'),
    children: [
      {
        path: 'new',
        name: 'new-map',
        component: () => import('./CreateMap.vue'),
      },
      // {
      //   path: 'edit/:data',
      //   name: 'edit-map',
      //   component: () => import('./EditMap.vue'),
      // }
    ]
    }
]

export function useMapMaker() {
    return { routes }
}
