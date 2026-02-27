export interface Point {
  x: number  // 0-100, percentage of image width
  y: number  // 0-100, percentage of image height
}

export interface Hold {
  id: string
  points: Point[]        // closed polygon, percentage coords. SVG closes with Z.
  strokeWidth: number    // percentage of image width (zoom-relative: visualWidth / scale)
  type: 'hand' | 'foot'
}
