import { useState } from 'react'

interface DrawToolbarProps {
  holdType: 'hand' | 'foot'
  onHoldTypeChange: (type: 'hand' | 'foot') => void
  strokeWidth: number // 1-5
  onStrokeWidthChange: (w: number) => void
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

export default function DrawToolbar({
  holdType,
  onHoldTypeChange,
  strokeWidth,
  onStrokeWidthChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: DrawToolbarProps) {
  const [showSlider, setShowSlider] = useState(false)

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-gray-900/80 backdrop-blur-sm rounded-full px-2 py-1.5"
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Hand/Foot toggle */}
      <button
        className="h-10 rounded-full flex items-center justify-center px-3 gap-1.5"
        style={{
          backgroundColor: holdType === 'hand' ? 'rgba(255,255,255,0.25)' : 'rgba(30,144,255,0.25)',
          border: `2px solid ${holdType === 'hand' ? 'white' : 'dodgerblue'}`,
        }}
        onClick={() => onHoldTypeChange(holdType === 'hand' ? 'foot' : 'hand')}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: holdType === 'hand' ? 'white' : 'dodgerblue' }}
        />
        <span className="text-xs font-bold" style={{ color: holdType === 'hand' ? 'white' : 'dodgerblue' }}>
          {holdType === 'hand' ? 'HAND' : 'FOOT'}
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Line thickness */}
      <div className="flex items-center">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center"
          onClick={() => setShowSlider(!showSlider)}
        >
          <div className="flex flex-col items-center gap-0.5">
            <div
              className="rounded-full"
              style={{
                width: 4 + strokeWidth * 3,
                height: 4 + strokeWidth * 3,
                backgroundColor: holdType === 'hand' ? 'white' : 'dodgerblue',
              }}
            />
          </div>
        </button>
        {showSlider && (
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={strokeWidth}
            onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
            className="w-24 ml-1 accent-white"
          />
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Undo */}
      <button
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          canUndo ? 'text-white' : 'text-gray-600 pointer-events-none'
        }`}
        onClick={onUndo}
        disabled={!canUndo}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 10h10a5 5 0 0 1 0 10H9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 6L3 10l4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Redo */}
      <button
        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
          canRedo ? 'text-white' : 'text-gray-600 pointer-events-none'
        }`}
        onClick={onRedo}
        disabled={!canRedo}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10H11a5 5 0 0 0 0 10h4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M17 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}
