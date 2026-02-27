import { useRef, useCallback, useState } from 'react'
import { useGestures } from '../hooks/useGestures'
import HoldCircle from './HoldCircle'
import type { Hold } from '../types'

type CanvasMode = 'view' | 'create-step1' | 'create-step2' | 'create-step3'

interface WallCanvasProps {
  imageUrl: string
  holds: Hold[]
  onHoldsChange?: (holds: Hold[]) => void
  onHoldTap?: (holdId: string) => void
  mode: CanvasMode
  darkOverlay?: boolean
}

const DEFAULT_RADIUS = 2.5
const LONG_PRESS_MS = 200

let holdIdCounter = 0
function nextHoldId(): string {
  return `hold-${Date.now()}-${holdIdCounter++}`
}

export default function WallCanvas({
  imageUrl,
  holds,
  onHoldsChange,
  onHoldTap,
  mode,
  darkOverlay,
}: WallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)

  // Hold-drag state
  const draggingHoldId = useRef<string | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dragTouchStart = useRef({ x: 0, y: 0 })

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }, [])

  // Convert screen coordinates to image percentage coordinates
  const screenToImageCoords = useCallback(
    (screenX: number, screenY: number, currentTransform: { scale: number; translateX: number; translateY: number }) => {
      const container = containerRef.current
      const img = imageRef.current
      if (!container || !img) return null

      const imgRect = img.getBoundingClientRect()

      // Position relative to the transformed image
      const imgX = (screenX - imgRect.left) / currentTransform.scale
      const imgY = (screenY - imgRect.top) / currentTransform.scale

      // Convert to percentage of displayed image size
      const displayWidth = img.clientWidth
      const displayHeight = img.clientHeight

      const percentX = (imgX / displayWidth) * 100
      const percentY = (imgY / displayHeight) * 100

      return { x: percentX, y: percentY }
    },
    []
  )

  // Find if a tap hit an existing hold
  const findHoldAtPoint = useCallback(
    (px: number, py: number): Hold | null => {
      // Check in reverse order (top-most first)
      for (let i = holds.length - 1; i >= 0; i--) {
        const hold = holds[i]
        const dx = px - hold.x
        const dy = py - hold.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist <= hold.radius + 1) {
          return hold
        }
      }
      return null
    },
    [holds]
  )

  const handleTap = useCallback(
    (screenX: number, screenY: number) => {
      if (mode === 'view') return

      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return
      if (coords.x < 0 || coords.x > 100 || coords.y < 0 || coords.y > 100) return

      const hitHold = findHoldAtPoint(coords.x, coords.y)

      if (mode === 'create-step1') {
        if (hitHold) {
          // Remove the hold
          onHoldsChange?.(holds.filter((h) => h.id !== hitHold.id))
        } else {
          // Place a new hand hold — radius is zoom-relative
          const newHold: Hold = {
            id: nextHoldId(),
            x: coords.x,
            y: coords.y,
            radius: DEFAULT_RADIUS / transformRef.current.scale,
            type: 'hand',
          }
          onHoldsChange?.([...holds, newHold])
        }
      } else if (mode === 'create-step2' || mode === 'create-step3') {
        if (hitHold) {
          onHoldTap?.(hitHold.id)
        }
      }
    },
    [mode, holds, onHoldsChange, onHoldTap, screenToImageCoords, findHoldAtPoint]
  )

  const handleDoubleTap = useCallback(
    (screenX: number, screenY: number) => {
      if (mode !== 'create-step1') return

      const coords = screenToImageCoords(screenX, screenY, transformRef.current)
      if (!coords) return

      const hitHold = findHoldAtPoint(coords.x, coords.y)
      if (!hitHold) return

      // Convert hand → foot_only, or foot_only → hand
      const newType = hitHold.type === 'hand' ? 'foot_only' : hitHold.type === 'foot_only' ? 'hand' : hitHold.type
      onHoldsChange?.(
        holds.map((h) => (h.id === hitHold.id ? { ...h, type: newType } : h))
      )
    },
    [mode, holds, onHoldsChange, screenToImageCoords, findHoldAtPoint]
  )

  const { transform, handlers, isDraggingHold } = useGestures({
    onTap: handleTap,
    onDoubleTap: handleDoubleTap,
    containerRef,
  })

  // Store transform in a ref so screenToImageCoords can access it without re-renders
  const transformRef = useRef(transform)
  transformRef.current = transform

  // Hold-and-drag to move circles
  const handleDragTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (mode !== 'create-step1' || e.touches.length !== 1) return

      const coords = screenToImageCoords(
        e.touches[0].clientX,
        e.touches[0].clientY,
        transformRef.current
      )
      if (!coords) return

      const hitHold = findHoldAtPoint(coords.x, coords.y)
      if (!hitHold) return

      // Record start position and start long-press timer
      dragTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }

      longPressTimer.current = setTimeout(() => {
        draggingHoldId.current = hitHold.id
        isDraggingHold.current = true
      }, LONG_PRESS_MS)
    },
    [mode, screenToImageCoords, findHoldAtPoint, isDraggingHold]
  )

  const handleDragTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length !== 1) return

      // If long-press timer is still running, check if finger moved too much
      if (longPressTimer.current && !isDraggingHold.current) {
        const dx = e.touches[0].clientX - dragTouchStart.current.x
        const dy = e.touches[0].clientY - dragTouchStart.current.y
        if (Math.abs(dx) + Math.abs(dy) > 10) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        return
      }

      if (!draggingHoldId.current) return

      const coords = screenToImageCoords(
        e.touches[0].clientX,
        e.touches[0].clientY,
        transformRef.current
      )
      if (!coords) return

      // Clamp to image bounds
      const clampedX = Math.max(0, Math.min(100, coords.x))
      const clampedY = Math.max(0, Math.min(100, coords.y))

      onHoldsChange?.(
        holds.map((h) =>
          h.id === draggingHoldId.current ? { ...h, x: clampedX, y: clampedY } : h
        )
      )
    },
    [holds, onHoldsChange, screenToImageCoords, isDraggingHold]
  )

  const handleDragTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    draggingHoldId.current = null
    isDraggingHold.current = false
  }, [isDraggingHold])

  // Combine gesture handlers with drag handlers
  const combinedTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragTouchStart(e)
      if (!isDraggingHold.current) {
        handlers.onTouchStart(e)
      }
    },
    [handleDragTouchStart, handlers, isDraggingHold]
  )

  const combinedTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDraggingHold.current) {
        handleDragTouchMove(e)
      } else {
        handleDragTouchMove(e) // still check for long-press cancel
        handlers.onTouchMove(e)
      }
    },
    [handleDragTouchMove, handlers, isDraggingHold]
  )

  const combinedTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isDraggingHold.current) {
        handleDragTouchEnd()
      } else {
        handleDragTouchEnd() // clean up timer
        handlers.onTouchEnd(e)
      }
    },
    [handleDragTouchEnd, handlers, isDraggingHold]
  )

  // Count start holds for tick mark calculation
  const startHandCount = holds.filter((h) => h.type === 'start_hand').length
  const getTickCount = (hold: Hold): 1 | 2 | undefined => {
    if (hold.type !== 'start_hand' && hold.type !== 'start_foot') return undefined
    if (hold.type === 'start_hand') return startHandCount >= 2 ? 1 : 2
    return 2
  }

  const nw = naturalSize?.w ?? 100
  const nh = naturalSize?.h ?? 100

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full"
      style={{ touchAction: 'none' }}
      onTouchStart={combinedTouchStart}
      onTouchMove={combinedTouchMove}
      onTouchEnd={combinedTouchEnd}
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
            >
              {darkOverlay && (
                <>
                  <defs>
                    <mask id="overlay-mask">
                      {/* White = show overlay, black = punch through */}
                      <rect x="0" y="0" width={nw} height={nh} fill="white" />
                      {holds.map((hold) => (
                        <circle
                          key={hold.id}
                          cx={(hold.x / 100) * nw}
                          cy={(hold.y / 100) * nh}
                          r={(hold.radius / 100) * nw}
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
              {holds.map((hold) => (
                <HoldCircle
                  key={hold.id}
                  hold={hold}
                  tickCount={getTickCount(hold)}
                  naturalWidth={nw}
                  naturalHeight={nh}
                />
              ))}
            </svg>
          )}
        </div>
      </div>
    </div>
  )
}
