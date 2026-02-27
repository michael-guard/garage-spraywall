import type { Point } from '../types'

// --- Segment intersection ---

export function segmentIntersection(
  p1: Point, p2: Point,
  p3: Point, p4: Point
): Point | null {
  const d1x = p2.x - p1.x, d1y = p2.y - p1.y
  const d2x = p4.x - p3.x, d2y = p4.y - p3.y
  const cross = d1x * d2y - d1y * d2x
  if (Math.abs(cross) < 1e-10) return null // parallel

  const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / cross
  const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / cross

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return { x: p1.x + t * d1x, y: p1.y + t * d1y }
  }
  return null
}

// --- Auto-close and nub trimming ---

const CLOSE_THRESHOLD = 2.0 // percentage of image width

export function autoClosePath(points: Point[]): Point[] {
  if (points.length < 3) return points

  const first = points[0]
  const last = points[points.length - 1]
  const endpointDist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2)

  // Case 1: Endpoints already close — snap closed
  if (endpointDist < CLOSE_THRESHOLD) {
    return points.slice(0, -1) // remove last point; SVG Z will close it
  }

  // Case 2: Find self-intersection near the start (nub trimming)
  // Walk backward from end, check against first segments
  const searchStart = Math.min(Math.floor(points.length * 0.2), 50)

  for (let endIdx = points.length - 2; endIdx >= Math.max(points.length - searchStart, searchStart + 1); endIdx--) {
    for (let startIdx = 0; startIdx < searchStart && startIdx < endIdx - 1; startIdx++) {
      const intersection = segmentIntersection(
        points[endIdx], points[endIdx + 1],
        points[startIdx], points[startIdx + 1]
      )
      if (intersection) {
        // Trim: keep from intersection through to the end intersection
        // The closed shape runs from the intersection point along startIdx+1..endIdx back to intersection
        const trimmed = [intersection, ...points.slice(startIdx + 1, endIdx + 1)]
        return trimmed
      }
    }
  }

  // Case 3: No intersection found — SVG Z will draw a straight line to close
  return points
}

// --- Ramer-Douglas-Peucker path simplification ---

function perpendicularDistance(point: Point, lineStart: Point, lineEnd: Point): number {
  const dx = lineEnd.x - lineStart.x
  const dy = lineEnd.y - lineStart.y
  const lenSq = dx * dx + dy * dy
  if (lenSq === 0) return Math.sqrt((point.x - lineStart.x) ** 2 + (point.y - lineStart.y) ** 2)
  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / lenSq))
  const projX = lineStart.x + t * dx
  const projY = lineStart.y + t * dy
  return Math.sqrt((point.x - projX) ** 2 + (point.y - projY) ** 2)
}

export function simplifyPath(points: Point[], epsilon: number = 0.15): Point[] {
  if (points.length <= 2) return points

  let maxDist = 0
  let maxIndex = 0
  const first = points[0]
  const last = points[points.length - 1]

  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last)
    if (dist > maxDist) {
      maxDist = dist
      maxIndex = i
    }
  }

  if (maxDist > epsilon) {
    const left = simplifyPath(points.slice(0, maxIndex + 1), epsilon)
    const right = simplifyPath(points.slice(maxIndex), epsilon)
    return [...left.slice(0, -1), ...right]
  }

  return [first, last]
}

// --- SVG path building ---

export function buildPathD(points: Point[], nw: number, nh: number): string {
  if (points.length === 0) return ''
  const first = points[0]
  let d = `M ${(first.x / 100) * nw} ${(first.y / 100) * nh}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${(points[i].x / 100) * nw} ${(points[i].y / 100) * nh}`
  }
  d += ' Z'
  return d
}

export function buildActivePathD(points: Point[], nw: number, nh: number): string {
  if (points.length === 0) return ''
  const first = points[0]
  let d = `M ${(first.x / 100) * nw} ${(first.y / 100) * nh}`
  for (let i = 1; i < points.length; i++) {
    d += ` L ${(points[i].x / 100) * nw} ${(points[i].y / 100) * nh}`
  }
  // No Z — path is still open during drawing
  return d
}
