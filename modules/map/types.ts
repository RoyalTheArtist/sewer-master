
export type MapLoadData = {
  meta: {
    name: string,
    size: [width: number, height: number]
  },
  tileset: string,
  layout: number[],
  legend: string[]
}
