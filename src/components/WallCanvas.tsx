import { useRef, useCallback, useState } from 'react'
import { useDrawGestures } from '../hooks/useDrawGestures'
import HoldShape from './HoldShape'
import { autoClosePath, simplifyPath, buildPathD, buildActivePathD } from '../lib/pathUtils'
import type { Hold, Point } from '../types'

interface WallCanvasProps {
  imageUrl: string
  holds: Hold[]
  onAddHold: (hold: Hold) => void
  holdType: 'hand' | 'foot'
  strokeWidth: number // 1-5 slider value
  darkOverlay?: boolean
}

const MIN_POINTS = 5
const MIN_POINT_DISTANCE = 0.3 // percentage of image width
// Slider 1-5 maps to base stroke width in percentage of image width
const STROKE_BASE = 0.15

let holdIdCounter = 0
function nextHoldId(): string {
  return `hold-${Date.now()}-${holdIdCounter++}`
}

export default function WallCanvas({
  imageUrl,
  holds,
  onAddHold,
  holdType,
  strokeWidth,
  darkOverlay,
}: WallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  // Active stroke state (in-progress drawing)
  const activeStrokePoints = useRef<Point[]>([])
  const activeStrokeType = useRef<'hand' | 'foot'>('hand')
  const activeStrokeWidth = useRef(0)
  const [strokeRevision, setStrokeRevision] = useState(0)

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }, [])

  // Convert screen coordinates to image percentage coordinates
  const screenToImageCoords = useCallback(
    (screenX: number, screenY: number, currentTransform: { scale: number; translateX: number; translateY: number }) => {
      const img = imageRef.current
      if (!img) return null

      const imgRect = img.getBoundingClientRect()
      const imgX = (screenX - imgRect.left) / currentTransform.scale
      const imgY = (screenY - imgRect.top) / currentTransform.scale

      const displayWidth = img.clientWidth
      const displayHeight = img.clientHeight

      const percentX = (imgX / displayWidth) * 100
      const percentY = (imgY / displayHeight) * 100

      return { x: percentX, y: percentY }
    },
    []
  )

  // Store transform ref for coordinate conversion
  const transformRef = useRef({ scale: 1, translateX: 0, translateY: 0 })

  const handleDrawStart = useCallback(
    (screenX: number, screenY: number) => {
      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return

      activeStrokePoints.current = [coords]
      activeStrokeType.current = holdType
      activeStrokeWidth.current = (strokeWidth * STROKE_BASE) / transformRef.current.scale
      setStrokeRevision((r) => r + 1)
    },
    [screenToImageCoords, holdType, strokeWidth]
  )

  const handleDrawMove = useCallback(
    (screenX: number, screenY: number) => {
      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return

      const points = activeStrokePoints.current
      if (points.length === 0) return

      // Minimum distance filter
      const last = points[points.length - 1]
      const dist = Math.sqrt((coords.x - last.x) ** 2 + (coords.y - last.y) ** 2)
      if (dist < MIN_POINT_DISTANCE) return

      points.push(coords)
      setStrokeRevision((r) => r + 1)
    },
    [screenToImageCoords]
  )

  const handleDrawEnd = useCallback(() => {
    const rawPoints = activeStrokePoints.current
    if (rawPoints.length < MIN_POINTS) {
      // Too small — discard
      activeStrokePoints.current = []
      setStrokeRevision((r) => r + 1)
      return
    }

    // Auto-close and trim nubs
    const closed = autoClosePath(rawPoints)
    // Simplify
    const simplified = simplifyPath(closed)

    if (simplified.length < 3) {
      activeStrokePoints.current = []
      setStrokeRevision((r) => r + 1)
      return
    }

    const newHold: Hold = {
      id: nextHoldId(),
      points: simplified,
      strokeWidth: activeStrokeWidth.current,
      type: activeStrokeType.current,
    }

    onAddHold(newHold)

    // Clear active stroke
    activeStrokePoints.current = []
    setStrokeRevision((r) => r + 1)
  }, [onAddHold])

  const handleDrawCancel = useCallback(() => {
    activeStrokePoints.current = []
    setStrokeRevision((r) => r + 1)
  }, [])

  const { transform, handlers } = useDrawGestures({
    onDrawStart: handleDrawStart,
    onDrawMove: handleDrawMove,
    onDrawEnd: handleDrawEnd,
    onDrawCancel: handleDrawCancel,
    containerRef,
  })

  // Keep transform ref in sync
  transformRef.current = transform

  const nw = naturalSize?.w ?? 100
  const nh = naturalSize?.h ?? 100

  // Active stroke rendering data
  const activePoints = activeStrokePoints.current
  const hasActiveStroke = activePoints.length > 1

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full"
      style={{ touchAction: 'none' }}
      onTouchStart={handlers.onTouchStart}
      onTouchMove={handlers.onTouchMove}
      onTouchEnd={handlers.onTouchEnd}
    >
      <div
        style={{
          transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        <div className="relative">
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Wall"
            className="w-full block"
            draggable={false}
            onLoad={handleImageLoad}
          />
          {naturalSize && (
            <svg
              viewBox={`0 0 ${nw} ${nh}`}
              className="absolute inset-0 w-full h-full"
              key={strokeRevision} // force re-render for active stroke
            >
              {darkOverlay && (
                <>
                  <defs>
                    <mask id="overlay-mask">
                      <rect x="0" y="0" width={nw} height={nh} fill="white" />
                      {holds.map((hold) => (
                        <path
                          key={hold.id}
                          d={buildPathD(hold.points, nw, nh)}
                          fill="black"
                        />
                      ))}
                    </mask>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width={nw}
                    height={nh}
                    fill="rgba(0, 0, 0, 0.55)"
                    mask="url(#overlay-mask)"
                  />
                </>
              )}
              {/* Committed holds */}
              {holds.map((hold) => (
                <HoldShape
                  key={hold.id}
                  hold={hold}
                  naturalWidth={nw}
                  naturalHeight={nh}
                />
              ))}
              {/* Active stroke (in-progress) */}
              {hasActiveStroke && (
                <path
                  d={buildActivePathD(activePoints, nw, nh)}
                  stroke={activeStrokeType.current === 'hand' ? 'white' : 'dodgerblue'}
                  strokeWidth={(activeStrokeWidth.current / 100) * nw}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.7}
                />
              )}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
