interface DrawToolbarProps {
  holdType: 'hand' | 'foot'
  onHoldTypeChange: (type: 'hand' | 'foot') => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export default function DrawToolbar({
  holdType,
  onHoldTypeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DrawToolbarProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900/80 backdrop-blur-sm rounded-full px-3 py-2"
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hand/Foot toggle */}
      <button
        className="h-12 rounded-full flex items-center justify-center px-4 gap-2"
        style={{
          backgroundColor: holdType === 'hand' ? 'rgba(255,255,255,0.25)' : 'rgba(30,144,255,0.25)',
          border: `2px solid ${holdType === 'hand' ? 'white' : 'dodgerblue'}`,
        }}
        onClick={() => onHoldTypeChange(holdType === 'hand' ? 'foot' : 'hand')}
      >
        <div
          className="w-3.5 h-3.5 rounded-full"
          style={{ backgroundColor: holdType === 'hand' ? 'white' : 'dodgerblue' }}
        />
        <span className="text-sm font-bold" style={{ color: holdType === 'hand' ? 'white' : 'dodgerblue' }}>
          {holdType === 'hand' ? 'HAND' : 'FOOT'}
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-7 bg-gray-600" />

      {/* Undo */}
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          canUndo ? 'text-white' : 'text-gray-600 pointer-events-none'
        }`}
        onClick={onUndo}
        disabled={!canUndo}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h10a5 5 0 0 1 0 10H9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6L3 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Redo */}
      <button
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          canRedo ? 'text-white' : 'text-gray-600 pointer-events-none'
        }`}
        onClick={onRedo}
        disabled={!canRedo}
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H11a5 5 0 0 0 0 10h4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
