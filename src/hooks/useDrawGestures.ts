import { useRef, useCallback, useState } from 'react'

interface DrawGestureCallbacks {
  onDrawStart: (screenX: number, screenY: number) => void
  onDrawMove: (screenX: number, screenY: number) => void
  onDrawEnd: () => void
  onDrawCancel: () => void
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

export function useDrawGestures({
  onDrawStart,
  onDrawMove,
  onDrawEnd,
  onDrawCancel,
  containerRef,
}: DrawGestureCallbacks) {
  const [transform, setTransform] = useState<Transform>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  })

  const isPinching = useRef(false)
  const isDrawing = useRef(false)
  const pinchStartDistance = useRef(0)
  const pinchStartScale = useRef(1)
  const pinchFocalPoint = useRef({ x: 0, y: 0 })
  const pinchContainerRect = useRef<DOMRect | null>(null)
  const transformRef = useRef(transform)

  transformRef.current = transform

  const clampTranslate = useCallback(
    (tx: number, ty: number, scale: number): { tx: number; ty: number } => {
      if (scale <= 1) return { tx: 0, ty: 0 }
      const container = containerRef.current
      if (!container) return { tx, ty }

      const rect = container.getBoundingClientRect()
      const minTx = -(rect.width * (scale - 1))
      const minTy = -(rect.height * (scale - 1))

      return {
        tx: Math.max(minTx, Math.min(0, tx)),
        ty: Math.max(minTy, Math.min(0, ty)),
      }
    },
    [containerRef]
  )

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (e.touches.length === 2) {
        // Cancel any active draw
        if (isDrawing.current) {
          isDrawing.current = false
          onDrawCancel()
        }

        // Start pinch
        isPinching.current = true
        const t = transformRef.current
        pinchStartDistance.current = getDistance(e.touches[0], e.touches[1])
        pinchStartScale.current = t.scale

        const container = containerRef.current
        if (container) {
          pinchContainerRect.current = container.getBoundingClientRect()
        }

        const mid = getMidpoint(e.touches[0], e.touches[1])
        const cr = pinchContainerRect.current
        if (cr) {
          pinchFocalPoint.current = {
            x: (mid.x - cr.left - t.translateX) / t.scale,
            y: (mid.y - cr.top - t.translateY) / t.scale,
          }
        }
      } else if (e.touches.length === 1 && !isPinching.current) {
        // Start drawing
        isDrawing.current = true
        onDrawStart(e.touches[0].clientX, e.touches[0].clientY)
      }
    },
    [containerRef, onDrawStart, onDrawCancel]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (isPinching.current && e.touches.length === 2) {
        // Pinch zoom + pan
        const newDistance = getDistance(e.touches[0], e.touches[1])
        const ratio = newDistance / pinchStartDistance.current
        const newScale = Math.max(
          MIN_SCALE,
          Math.min(MAX_SCALE, pinchStartScale.current * ratio)
        )

        const cr = pinchContainerRect.current
        if (cr) {
          const currentMid = getMidpoint(e.touches[0], e.touches[1])
          const newTx = (currentMid.x - cr.left) - pinchFocalPoint.current.x * newScale
          const newTy = (currentMid.y - cr.top) - pinchFocalPoint.current.y * newScale
          const clamped = clampTranslate(newTx, newTy, newScale)

          setTransform({
            scale: newScale,
            translateX: clamped.tx,
            translateY: clamped.ty,
          })
        }
      } else if (isDrawing.current && e.touches.length === 1) {
        // Continue drawing
        onDrawMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    },
    [clampTranslate, onDrawMove]
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()

      if (isPinching.current) {
        if (e.touches.length < 2) {
          isPinching.current = false
        }
        return
      }

      if (isDrawing.current && e.touches.length === 0) {
        isDrawing.current = false
        onDrawEnd()
      }
    },
    [onDrawEnd]
  )

  return {
    transform,
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
    },
  }
}
