import { useRef, useCallback } from 'react'
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
const MIN_RADIUS = 1
const MAX_RADIUS = 10
const EDGE_TOLERANCE = 2 // viewBox units for resize hit zone

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
  const resizingHoldId = useRef<string | null>(null)

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

  // Check if a point is on the edge of a hold (for resize)
  const findHoldEdge = useCallback(
    (px: number, py: number): Hold | null => {
      for (let i = holds.length - 1; i >= 0; i--) {
        const hold = holds[i]
        const dx = px - hold.x
        const dy = py - hold.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (
          dist >= hold.radius - EDGE_TOLERANCE &&
          dist <= hold.radius + EDGE_TOLERANCE
        ) {
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
          // Place a new hand hold
          const newHold: Hold = {
            id: nextHoldId(),
            x: coords.x,
            y: coords.y,
            radius: DEFAULT_RADIUS,
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

  const { transform, handlers, isResizing } = useGestures({
    onTap: handleTap,
    onDoubleTap: handleDoubleTap,
    containerRef,
  })

  // Store transform in a ref so screenToImageCoords can access it without re-renders
  const transformRef = useRef(transform)
  transformRef.current = transform

  // Handle resize touch events
  const handleResizeTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (mode !== 'create-step1' || e.touches.length !== 1) return

      const coords = screenToImageCoords(
        e.touches[0].clientX,
        e.touches[0].clientY,
        transformRef.current
      )
      if (!coords) return

      const edgeHold = findHoldEdge(coords.x, coords.y)
      if (edgeHold) {
        resizingHoldId.current = edgeHold.id
        isResizing.current = true
      }
    },
    [mode, screenToImageCoords, findHoldEdge, isResizing]
  )

  const handleResizeTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!resizingHoldId.current || e.touches.length !== 1) return

      const coords = screenToImageCoords(
        e.touches[0].clientX,
        e.touches[0].clientY,
        transformRef.current
      )
      if (!coords) return

      const hold = holds.find((h) => h.id === resizingHoldId.current)
      if (!hold) return

      const dx = coords.x - hold.x
      const dy = coords.y - hold.y
      const newRadius = Math.max(
        MIN_RADIUS,
        Math.min(MAX_RADIUS, Math.sqrt(dx * dx + dy * dy))
      )

      onHoldsChange?.(
        holds.map((h) =>
          h.id === resizingHoldId.current ? { ...h, radius: newRadius } : h
        )
      )
    },
    [holds, onHoldsChange, screenToImageCoords]
  )

  const handleResizeTouchEnd = useCallback(() => {
    resizingHoldId.current = null
    isResizing.current = false
  }, [isResizing])

  // Combine gesture handlers with resize handlers
  const combinedTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleResizeTouchStart(e)
      if (!isResizing.current) {
        handlers.onTouchStart(e)
      }
    },
    [handleResizeTouchStart, handlers, isResizing]
  )

  const combinedTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isResizing.current) {
        handleResizeTouchMove(e)
      } else {
        handlers.onTouchMove(e)
      }
    },
    [handleResizeTouchMove, handlers, isResizing]
  )

  const combinedTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (isResizing.current) {
        handleResizeTouchEnd()
      } else {
        handlers.onTouchEnd(e)
      }
    },
    [handleResizeTouchEnd, handlers, isResizing]
  )

  // Count start holds for tick mark calculation
  const startHandCount = holds.filter((h) => h.type === 'start_hand').length
  const getTickCount = (hold: Hold): 1 | 2 | undefined => {
    if (hold.type !== 'start_hand' && hold.type !== 'start_foot') return undefined
    if (hold.type === 'start_hand') return startHandCount >= 2 ? 1 : 2
    return 2
  }

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
          />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {darkOverlay && (
              <rect
                x="0"
                y="0"
                width="100"
                height="100"
                fill="rgba(0, 0, 0, 0.55)"
              />
            )}
            {holds.map((hold) => (
              <HoldCircle
                key={hold.id}
                hold={hold}
                tickCount={getTickCount(hold)}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  )
}
