import { buildPathD, getHoldCentroid, getHoldBottomY } from '../lib/pathUtils'
import type { Hold } from '../types'

interface HoldShapeProps {
  hold: Hold
  naturalWidth: number
  naturalHeight: number
  isStart?: boolean
  isFinish?: boolean
  startCount?: number // total number of start holds (1 or 2)
}

export default function HoldShape({
  hold,
  naturalWidth,
  naturalHeight,
  isStart,
  isFinish,
  startCount = 1,
}: HoldShapeProps) {
  const d = buildPathD(hold.points, naturalWidth, naturalHeight)
  const strokeW = (hold.strokeWidth / 100) * naturalWidth

  // Determine stroke color
  let stroke: string
  if (isFinish) {
    stroke = 'black'
  } else if (hold.type === 'foot') {
    stroke = 'dodgerblue'
  } else {
    stroke = 'white'
  }

  // Tick marks for start holds
  const tickElements = isStart ? renderTickMarks(hold, naturalWidth, naturalHeight, startCount) : null

  return (
    <g>
      <path
        d={d}
        stroke={stroke}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      {tickElements}
    </g>
  )
}

function renderTickMarks(
  hold: Hold,
  nw: number,
  nh: number,
  startCount: number
) {
  const centroid = getHoldCentroid(hold)
  const bottomY = getHoldBottomY(hold)

  // Convert percentage coords to natural pixel coords
  const cx = (centroid.x / 100) * nw
  const by = (bottomY / 100) * nh

  // Tick dimensions in natural pixels
  const tickLen = nw * 0.015 // 1.5% of image width
  const tickStroke = nw * 0.004 // stroke width for ticks
  const gap = nw * 0.008 // gap below shape
  const spacing = nw * 0.008 // spacing between two ticks

  // 1 start hold → 2 ticks per hold, 2 start holds → 1 tick each
  const tickCount = startCount === 1 ? 2 : 1

  const tickY1 = by + gap
  const tickY2 = by + gap + tickLen

  if (tickCount === 2) {
    return (
      <>
        <line
          x1={cx - spacing} y1={tickY1} x2={cx - spacing} y2={tickY2}
          stroke="white" strokeWidth={tickStroke} strokeLinecap="round"
        />
        <line
          x1={cx + spacing} y1={tickY1} x2={cx + spacing} y2={tickY2}
          stroke="white" strokeWidth={tickStroke} strokeLinecap="round"
        />
      </>
    )
  }

  return (
    <line
      x1={cx} y1={tickY1} x2={cx} y2={tickY2}
      stroke="white" strokeWidth={tickStroke} strokeLinecap="round"
    />
  )
}
