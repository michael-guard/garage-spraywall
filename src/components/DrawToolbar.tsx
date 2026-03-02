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
        aria-label={`Feet rules: ${FEET_RULES_LABELS[feetRules]}`}
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
        aria-label="Undo"
      >
        <svg viewBox="0 0 640 640" className="w-7 h-7" fill="currentColor">
          <path d="M88 256L232 256C241.7 256 250.5 250.2 254.2 241.2C257.9 232.2 255.9 221.9 249 215L202.3 168.3C277.6 109.7 386.6 115 455.8 184.2C530.8 259.2 530.8 380.7 455.8 455.7C380.8 530.7 259.3 530.7 184.3 455.7C174.1 445.5 165.3 434.4 157.9 422.7C148.4 407.8 128.6 403.4 113.7 412.9C98.8 422.4 94.4 442.2 103.9 457.1C113.7 472.7 125.4 487.5 139 501C239 601 401 601 501 501C601 401 601 239 501 139C406.8 44.7 257.3 39.3 156.7 122.8L105 71C98.1 64.2 87.8 62.1 78.8 65.8C69.8 69.5 64 78.3 64 88L64 232C64 245.3 74.7 256 88 256z"/>
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
        aria-label={holdType === 'hand' ? 'Switch to foot mode' : 'Switch to hand mode'}
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
        aria-label="Redo"
      >
        <svg viewBox="0 0 640 640" className="w-7 h-7" fill="currentColor">
          <path d="M552 256L408 256C398.3 256 389.5 250.2 385.8 241.2C382.1 232.2 384.1 221.9 391 215L437.7 168.3C362.4 109.7 253.4 115 184.2 184.2C109.2 259.2 109.2 380.7 184.2 455.7C259.2 530.7 380.7 530.7 455.7 455.7C463.9 447.5 471.2 438.8 477.6 429.6C487.7 415.1 507.7 411.6 522.2 421.7C536.7 431.8 540.2 451.8 530.1 466.3C521.6 478.5 511.9 490.1 501 501C401 601 238.9 601 139 501C39.1 401 39 239 139 139C233.3 44.7 382.7 39.4 483.3 122.8L535 71C541.9 64.1 552.2 62.1 561.2 65.8C570.2 69.5 576 78.3 576 88L576 232C576 245.3 565.3 256 552 256z"/>
        </svg>
      </button>
    </div>
  )
}
