import type { FeetRules } from '../types'

interface FeetRulesToggleProps {
  value: FeetRules
  onChange: (value: FeetRules) => void
}

const options: { value: FeetRules; label: string }[] = [
  { value: 'selected_only', label: 'Selected Feet' },
  { value: 'follow_hands', label: 'Feet Follow' },
  { value: 'open', label: 'Open Feet' },
]

export default function FeetRulesToggle({ value, onChange }: FeetRulesToggleProps) {
  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex bg-gray-900/80 backdrop-blur-sm rounded-full p-1"
      onTouchStart={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === opt.value
              ? 'bg-blue-600 text-white'
              : 'text-gray-400'
          }`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
