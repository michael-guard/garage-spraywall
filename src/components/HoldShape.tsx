import { buildPathD } from '../lib/pathUtils'
import type { Hold } from '../types'

interface HoldShapeProps {
  hold: Hold
  naturalWidth: number
  naturalHeight: number
}

export default function HoldShape({ hold, naturalWidth, naturalHeight }: HoldShapeProps) {
  const d = buildPathD(hold.points, naturalWidth, naturalHeight)
  const strokeW = (hold.strokeWidth / 100) * naturalWidth
  const stroke = hold.type === 'hand' ? 'white' : 'dodgerblue'

  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={strokeW}
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
  )
}
