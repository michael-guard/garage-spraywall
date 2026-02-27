import { useRef, useCallback, useState } from 'react'

interface GestureCallbacks {
  onTap?: (x: number, y: number) => void
  onDoubleTap?: (x: number, y: number) => void
  containerRef: React.RefObject<HTMLDivElement | null>
}

interface Transform {
  scale: number
  translateX: number
  translateY: number
}

function getDistance(t1: React.Touch, t2: React.Touch): number {
  const dx = t1.clientX - t2.clientX
  const dy = t1.clientY - t2.clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function getMidpoint(t1: React.Touch, t2: React.Touch): { x: number; y: number } {
  return {
    x: (t1.clientX + t2.clientX) / 2,
    y: (t1.clientY + t2.clientY) / 2,
  }
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const TAP_THRESHOLD = 10 // max pixels of movement to still count as a tap
const TAP_DURATION = 300 // max ms for a touch to count as a tap
const DOUBLE_TAP_GAP = 300 // max ms between taps for double-tap

export function useGestures({ onTap, onDoubleTap, containerRef }: GestureCallbacks) {
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })

  // Refs for tracking gesture state (no re-renders needed)
  const isPinching = useRef(false)
  const isPanning = useRef(false)
  const pinchStartDistance = useRef(0)
  const pinchStartScale = useRef(1)
  const pinchStartMidpoint = useRef({ x: 0, y: 0 })
  const pinchStartTranslate = useRef({ x: 0, y: 0 })
  const panStartPoint = useRef({ x: 0, y: 0 })
  const panStartTranslate = useRef({ x: 0, y: 0 })
  const touchStartTime = useRef(0)
  const touchStartPos = useRef({ x: 0, y: 0 })
  const lastTapTime = useRef(0)
  const lastTapPos = useRef({ x: 0, y: 0 })
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const transformRef = useRef(transform)
  // Track if a resize is in progress (set by WallCanvas)
  const isResizing = useRef(false)

  // Keep ref in sync with state
  transformRef.current = transform

  const clampTranslate = useCallback(
    (tx: number, ty: number, scale: number): { tx: number; ty: number } => {
      if (scale <= 1) return { tx: 0, ty: 0 }
      const container = containerRef.current
      if (!container) return { tx, ty }

      const rect = container.getBoundingClientRect()
      const maxTx = (rect.width * (scale - 1)) / 2
      const maxTy = (rect.height * (scale - 1)) / 2

      return {
        tx: Math.max(-maxTx, Math.min(maxTx, tx)),
        ty: Math.max(-maxTy, Math.min(maxTy, ty)),
      }
    },
    [containerRef]
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 2) {
        // Start pinch
        isPinching.current = true
        isPanning.current = false
        const t = transformRef.current
        pinchStartDistance.current = getDistance(e.touches[0], e.touches[1])
        pinchStartScale.current = t.scale
        pinchStartMidpoint.current = getMidpoint(e.touches[0], e.touches[1])
        pinchStartTranslate.current = { x: t.translateX, y: t.translateY }
      } else if (e.touches.length === 1 && !isResizing.current) {
        // Record for potential pan or tap
        touchStartTime.current = Date.now()
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        }
        isPanning.current = false
      }
    },
    []
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (isResizing.current) return

      if (isPinching.current && e.touches.length === 2) {
        // Handle pinch zoom
        const newDistance = getDistance(e.touches[0], e.touches[1])
        const ratio = newDistance / pinchStartDistance.current
        const newScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, pinchStartScale.current * ratio)
        )

        // Zoom toward the pinch midpoint
        const currentMidpoint = getMidpoint(e.touches[0], e.touches[1])
        const scaleChange = newScale / pinchStartScale.current

        const newTx =
          currentMidpoint.x -
          pinchStartMidpoint.current.x +
          pinchStartTranslate.current.x * scaleChange
        const newTy =
          currentMidpoint.y -
          pinchStartMidpoint.current.y +
          pinchStartTranslate.current.y * scaleChange

        const clamped = clampTranslate(newTx, newTy, newScale)

        setTransform({
          scale: newScale,
          translateX: clamped.tx,
          translateY: clamped.ty,
        })
      } else if (e.touches.length === 1 && !isPinching.current) {
        // Handle pan
        const dx = e.touches[0].clientX - touchStartPos.current.x
        const dy = e.touches[0].clientY - touchStartPos.current.y

        // Start panning after threshold
        if (!isPanning.current && Math.abs(dx) + Math.abs(dy) > TAP_THRESHOLD) {
          isPanning.current = true
          panStartPoint.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
          }
          panStartTranslate.current = {
            x: transformRef.current.translateX,
            y: transformRef.current.translateY,
          }
        }

        if (isPanning.current) {
          const panDx = e.touches[0].clientX - panStartPoint.current.x
          const panDy = e.touches[0].clientY - panStartPoint.current.y
          const newTx = panStartTranslate.current.x + panDx
          const newTy = panStartTranslate.current.y + panDy
          const clamped = clampTranslate(
            newTx,
            newTy,
            transformRef.current.scale
          )

          setTransform((prev) => ({
            ...prev,
            translateX: clamped.tx,
            translateY: clamped.ty,
          }))
        }
      }
    },
    [clampTranslate]
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (isResizing.current) return

      // If was pinching and fingers lifted, exit pinch
      if (isPinching.current) {
        if (e.touches.length < 2) {
          isPinching.current = false
        }
        return
      }

      // Check if this was a tap (short duration, minimal movement)
      if (isPanning.current) {
        isPanning.current = false
        return
      }

      const duration = Date.now() - touchStartTime.current
      if (duration > TAP_DURATION) return

      const tapX = touchStartPos.current.x
      const tapY = touchStartPos.current.y

      const now = Date.now()
      const timeSinceLastTap = now - lastTapTime.current
      const distFromLastTap = Math.sqrt(
        (tapX - lastTapPos.current.x) ** 2 +
          (tapY - lastTapPos.current.y) ** 2
      )

      if (
        timeSinceLastTap < DOUBLE_TAP_GAP &&
        distFromLastTap < TAP_THRESHOLD * 3
      ) {
        // Double tap
        if (tapTimer.current) {
          clearTimeout(tapTimer.current)
          tapTimer.current = null
        }
        lastTapTime.current = 0
        onDoubleTap?.(tapX, tapY)
      } else {
        // Potential single tap — wait to see if a second tap comes
        lastTapTime.current = now
        lastTapPos.current = { x: tapX, y: tapY }

        if (tapTimer.current) clearTimeout(tapTimer.current)
        tapTimer.current = setTimeout(() => {
          tapTimer.current = null
          onTap?.(tapX, tapY)
        }, DOUBLE_TAP_GAP)
      }
    },
    [onTap, onDoubleTap]
  )

  return {
    transform,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
    isResizing,
  }
}
