import { useRef, useCallback, useState } from 'react'

const EDGE_ZONE = 30 // Ignore touches starting within 30px of screen edges
const SWIPE_THRESHOLD = 50 // Minimum distance to trigger navigation
const VERTICAL_LOCK_RATIO = 1.5 // If vertical > horizontal * ratio, lock to vertical
const VELOCITY_THRESHOLD = 0.3 // px/ms — fast swipes bypass distance threshold

interface UseSwipeNavigationOptions {
  onSwipeLeft: () => void // Navigate to next problem
  onSwipeRight: () => void // Navigate to previous problem
  canSwipeLeft?: boolean // Has next problem
  canSwipeRight?: boolean // Has previous problem
  disabled?: boolean
}

export default function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  canSwipeLeft = true,
  canSwipeRight = true,
  disabled = false,
}: UseSwipeNavigationOptions) {
  const [translateX, setTranslateX] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  const startX = useRef(0)
  const startY = useRef(0)
  const startTime = useRef(0)
  const tracking = useRef(false)
  const lockedAxis = useRef<'horizontal' | 'vertical' | null>(null)

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || transitioning) return
      if (e.touches.length !== 1) {
        tracking.current = false
        return
      }

      const x = e.touches[0].clientX
      // Ignore touches in edge zone (Chrome back gesture area)
      if (x < EDGE_ZONE || x > window.innerWidth - EDGE_ZONE) {
        tracking.current = false
        return
      }

      startX.current = x
      startY.current = e.touches[0].clientY
      startTime.current = Date.now()
      tracking.current = true
      lockedAxis.current = null
    },
    [disabled, transitioning]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!tracking.current || e.touches.length !== 1) return

      const dx = e.touches[0].clientX - startX.current
      const dy = e.touches[0].clientY - startY.current
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      // Lock axis after initial movement
      if (lockedAxis.current === null && (absDx > 10 || absDy > 10)) {
        if (absDy > absDx * VERTICAL_LOCK_RATIO) {
          lockedAxis.current = 'vertical'
        } else {
          lockedAxis.current = 'horizontal'
        }
      }

      if (lockedAxis.current !== 'horizontal') return

      // Apply resistance when swiping toward a boundary with no target
      if ((dx < 0 && !canSwipeLeft) || (dx > 0 && !canSwipeRight)) {
        setTranslateX(dx * 0.2) // Rubber-band resistance
      } else {
        setTranslateX(dx)
      }
    },
    [canSwipeLeft, canSwipeRight]
  )

  const onTouchEnd = useCallback(
    () => {
      if (!tracking.current || lockedAxis.current !== 'horizontal') {
        tracking.current = false
        setTranslateX(0)
        return
      }

      tracking.current = false

      const dx = translateX
      const absDx = Math.abs(dx)
      const elapsed = Date.now() - startTime.current
      const velocity = absDx / Math.max(elapsed, 1)

      const triggered = absDx > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD

      if (triggered && dx < 0 && canSwipeLeft) {
        // Swipe left → next
        setTransitioning(true)
        setTranslateX(-window.innerWidth)
        setTimeout(() => {
          onSwipeLeft()
          setTranslateX(0)
          setTransitioning(false)
        }, 200)
      } else if (triggered && dx > 0 && canSwipeRight) {
        // Swipe right → prev
        setTransitioning(true)
        setTranslateX(window.innerWidth)
        setTimeout(() => {
          onSwipeRight()
          setTranslateX(0)
          setTransitioning(false)
        }, 200)
      } else {
        // Snap back
        setTransitioning(true)
        setTranslateX(0)
        setTimeout(() => setTransitioning(false), 200)
      }
    },
    [translateX, onSwipeLeft, onSwipeRight, canSwipeLeft, canSwipeRight]
  )

  const style: React.CSSProperties = {
    transform: translateX !== 0 ? `translateX(${translateX}px)` : undefined,
    transition: transitioning ? 'transform 200ms ease-out' : undefined,
  }

  return { onTouchStart, onTouchMove, onTouchEnd, style }
}
