import { useRef, useCallback, useState } from 'react'
import { useDrawGestures } from '../hooks/useDrawGestures'
import { useSelectGestures } from '../hooks/useSelectGestures'
import HoldShape from './HoldShape'
import { autoClosePath, simplifyPath, buildPathD, buildActivePathD, pointInHold } from '../lib/pathUtils'
import type { Hold, Point } from '../types'

interface WallCanvasProps {
  imageUrl: string
  holds: Hold[]
  darkOverlay?: boolean
  // Draw mode (step 1)
  onAddHold?: (hold: Hold) => void
  holdType?: 'hand' | 'foot'
  // Select mode (steps 2-3)
  onHoldTap?: (holdId: string) => void
  tappableHoldIds?: Set<string>
  startHoldIds?: Set<string>
  finishHoldIds?: Set<string>
}

const MIN_POINTS = 5
const MIN_POINT_DISTANCE = 0.3 // percentage of image width
// Fixed stroke width: 2.25% of image width (old middle slider value 3 × 0.75 base)
const FIXED_STROKE = 2.25

let holdIdCounter = 0
function nextHoldId(): string {
  return `hold-${Date.now()}-${holdIdCounter++}`
}

export default function WallCanvas({
  imageUrl,
  holds,
  darkOverlay,
  onAddHold,
  holdType = 'hand',
  onHoldTap,
  tappableHoldIds,
  startHoldIds,
  finishHoldIds,
}: WallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  const isDrawMode = !!onAddHold
  const isSelectMode = !!onHoldTap

  // Active stroke state (in-progress drawing) — only used in draw mode
  const activeStrokePoints = useRef<Point[]>([])
  const activeStrokeType = useRef<'hand' | 'foot'>('hand')
  const activeStrokeWidth = useRef(0)
  const [strokeRevision, setStrokeRevision] = useState(0)
  void strokeRevision

  // Ref to avoid stale closure in draw callbacks
  const holdTypeRef = useRef(holdType)
  holdTypeRef.current = holdType

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

  // --- Draw mode callbacks ---

  const handleDrawStart = useCallback(
    (screenX: number, screenY: number) => {
      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return

      activeStrokePoints.current = [coords]
      activeStrokeType.current = holdTypeRef.current
      activeStrokeWidth.current = FIXED_STROKE / transformRef.current.scale
      setStrokeRevision((r) => r + 1)
    },
    [screenToImageCoords]
  )

  const handleDrawMove = useCallback(
    (screenX: number, screenY: number) => {
      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return

      const points = activeStrokePoints.current
      if (points.length === 0) return

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
      activeStrokePoints.current = []
      setStrokeRevision((r) => r + 1)
      return
    }

    const closed = autoClosePath(rawPoints)
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

    onAddHold?.(newHold)
    activeStrokePoints.current = []
    setStrokeRevision((r) => r + 1)
  }, [onAddHold])

  const handleDrawCancel = useCallback(() => {
    activeStrokePoints.current = []
    setStrokeRevision((r) => r + 1)
  }, [])

  // --- Select mode callback ---

  const handleTap = useCallback(
    (screenX: number, screenY: number) => {
      if (!onHoldTap) return
      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return

      // Hit test against tappable holds (iterate in reverse so topmost wins)
      for (let i = holds.length - 1; i >= 0; i--) {
        const hold = holds[i]
        if (tappableHoldIds && !tappableHoldIds.has(hold.id)) continue
        if (pointInHold(coords, hold)) {
          onHoldTap(hold.id)
          return
        }
      }
    },
    [onHoldTap, holds, tappableHoldIds, screenToImageCoords]
  )

  // --- Gesture hooks (both always called for React rules, only one active) ---

  const drawGestures = useDrawGestures({
    onDrawStart: isDrawMode ? handleDrawStart : () => {},
    onDrawMove: isDrawMode ? handleDrawMove : () => {},
    onDrawEnd: isDrawMode ? handleDrawEnd : () => {},
    onDrawCancel: isDrawMode ? handleDrawCancel : () => {},
    containerRef,
  })

  const selectGestures = useSelectGestures({
    onTap: isSelectMode ? handleTap : () => {},
    containerRef,
  })

  // Pick active gesture set: use selectGestures for both select and view-only mode
  const useSelect = isSelectMode || !isDrawMode
  const activeTransform = useSelect ? selectGestures.transform : drawGestures.transform
  const activeHandlers = useSelect ? selectGestures.handlers : drawGestures.handlers

  // Keep transform ref in sync
  transformRef.current = activeTransform

  const nw = naturalSize?.w ?? 100
  const nh = naturalSize?.h ?? 100

  // Active stroke rendering data (draw mode only)
  const activePoints = activeStrokePoints.current
  const hasActiveStroke = isDrawMode && activePoints.length > 1

  // Start hold count for tick mark rendering
  const startCount = startHoldIds?.size ?? 0

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full h-full"
      style={{ touchAction: 'none' }}
      onTouchStart={activeHandlers.onTouchStart}
      onTouchMove={activeHandlers.onTouchMove}
      onTouchEnd={activeHandlers.onTouchEnd}
    >
      <div
        style={{
          transform: `translate(${activeTransform.translateX}px, ${activeTransform.translateY}px) scale(${activeTransform.scale})`,
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
                  isStart={startHoldIds?.has(hold.id)}
                  isFinish={finishHoldIds?.has(hold.id)}
                  startCount={startCount}
                />
              ))}
              {/* Active stroke (in-progress, draw mode only) */}
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
