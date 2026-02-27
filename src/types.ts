export interface Hold {
  id: string
  x: number       // 0-100, percentage of image width
  y: number       // 0-100, percentage of image height
  radius: number  // 0-100, percentage of image width
  type: 'hand' | 'foot_only' | 'start_hand' | 'start_foot' | 'finish'
}
