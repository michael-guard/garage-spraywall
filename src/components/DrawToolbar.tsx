import type { FeetRules } from '../types'

interface DrawToolbarProps {
  holdType: 'hand' | 'foot'
  onHoldTypeChange: (type: 'hand' | 'foot') => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  feetRules: FeetRules
  onFeetRulesChange: (value: FeetRules) => void
}

const FEET_RULES_ORDER: FeetRules[] = ['selected_only', 'follow_hands', 'open']
const FEET_RULES_LABELS: Record<FeetRules, string> = {
  selected_only: 'SELECTED',
  follow_hands: 'FOLLOW',
  open: 'OPEN',
}

export default function DrawToolbar({
  holdType,
  onHoldTypeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  feetRules,
  onFeetRulesChange,
}: DrawToolbarProps) {
  const cycleFeetRules = () => {
    const currentIndex = FEET_RULES_ORDER.indexOf(feetRules)
    const nextIndex = (currentIndex + 1) % FEET_RULES_ORDER.length
    onFeetRulesChange(FEET_RULES_ORDER[nextIndex])
  }

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-2"
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Feet rules cycling toggle */}
      <button
        className="h-12 rounded-full flex items-center justify-center px-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
        }}
        onClick={cycleFeetRules}
      >
        <span className="text-sm font-bold text-white">
          {FEET_RULES_LABELS[feetRules]}
        </span>
      </button>

      {/* Undo */}
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          canUndo ? 'text-white' : 'text-gray-600 pointer-events-none'
        }`}
        onClick={onUndo}
        disabled={!canUndo}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h10a5 5 0 0 1 0 10H9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6L3 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Hand/Foot toggle — no dot, just text */}
      <button
        className="h-12 rounded-full flex items-center justify-center px-4"
        style={{
          backgroundColor: holdType === 'hand' ? 'rgba(255,255,255,0.25)' : 'rgba(30,144,255,0.25)',
          border: `2px solid ${holdType === 'hand' ? 'white' : 'dodgerblue'}`,
        }}
        onClick={() => onHoldTypeChange(holdType === 'hand' ? 'foot' : 'hand')}
      >
        <span className="text-sm font-bold" style={{ color: holdType === 'hand' ? 'white' : 'dodgerblue' }}>
          {holdType === 'hand' ? 'HAND' : 'FOOT'}
        </span>
      </button>

      {/* Redo */}
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          canRedo ? 'text-white' : 'text-gray-600 pointer-events-none'
        }`}
        onClick={onRedo}
        disabled={!canRedo}
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H11a5 5 0 0 0 0 10h4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
