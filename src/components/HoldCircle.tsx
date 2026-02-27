import type { Hold } from '../types'

interface HoldCircleProps {
  hold: Hold
  tickCount?: 1 | 2 // for start holds: 2 ticks if 1 start, 1 tick each if 2 starts
  naturalWidth: number
  naturalHeight: number
}

export default function HoldCircle({ hold, tickCount, naturalWidth, naturalHeight }: HoldCircleProps) {
  const { x, y, radius, type } = hold

  // Convert percentage coords to pixel coords
  const cx = (x / 100) * naturalWidth
  const cy = (y / 100) * naturalHeight
  const r = (radius / 100) * naturalWidth

  const strokeWidth = naturalWidth * 0.004

  const getStroke = () => {
    switch (type) {
      case 'hand':
      case 'start_hand':
        return 'white'
      case 'foot_only':
      case 'start_foot':
        return 'dodgerblue'
      case 'finish':
        return 'white'
      default:
        return 'white'
    }
  }

  const getFill = () => {
    switch (type) {
      case 'finish':
        return 'rgba(0, 0, 0, 0.8)'
      default:
        return 'none'
    }
  }

  const isStart = type === 'start_hand' || type === 'start_foot'
  const ticks = isStart ? (tickCount ?? 2) : 0

  const tickOffset = r + naturalWidth * 0.006
  const tickLength = naturalWidth * 0.012
  const tickSpacing = naturalWidth * 0.005

  return (
    <g>
      {/* Main circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={getStroke()}
        strokeWidth={strokeWidth}
        fill={getFill()}
      />

      {/* Tick marks for start holds */}
      {ticks >= 1 && (
        <line
          x1={cx - tickSpacing}
          y1={cy + tickOffset}
          x2={cx - tickSpacing}
          y2={cy + tickOffset + tickLength}
          stroke={getStroke()}
          strokeWidth={strokeWidth * 0.8}
        />
      )}
      {ticks >= 2 && (
        <line
          x1={cx + tickSpacing}
          y1={cy + tickOffset}
          x2={cx + tickSpacing}
          y2={cy + tickOffset + tickLength}
          stroke={getStroke()}
          strokeWidth={strokeWidth * 0.8}
        />
      )}
    </g>
  )
}
