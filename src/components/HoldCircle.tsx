import type { Hold } from '../types'

interface HoldCircleProps {
  hold: Hold
  tickCount?: 1 | 2 // for start holds: 2 ticks if 1 start, 1 tick each if 2 starts
}

const STROKE_WIDTH = 0.5

export default function HoldCircle({ hold, tickCount }: HoldCircleProps) {
  const { x, y, radius, type } = hold

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

  const tickOffset = radius + 0.8
  const tickLength = 1.2

  return (
    <g>
      {/* Main circle */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        stroke={getStroke()}
        strokeWidth={STROKE_WIDTH}
        fill={getFill()}
      />

      {/* Tick marks for start holds */}
      {ticks >= 1 && (
        <line
          x1={x - 0.5}
          y1={y + tickOffset}
          x2={x - 0.5}
          y2={y + tickOffset + tickLength}
          stroke={getStroke()}
          strokeWidth={STROKE_WIDTH * 0.8}
        />
      )}
      {ticks >= 2 && (
        <line
          x1={x + 0.5}
          y1={y + tickOffset}
          x2={x + 0.5}
          y2={y + tickOffset + tickLength}
          stroke={getStroke()}
          strokeWidth={STROKE_WIDTH * 0.8}
        />
      )}
    </g>
  )
}
