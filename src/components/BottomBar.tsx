import { useNavigate } from 'react-router-dom'

interface BottomBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onFilterOpen: () => void
  isSavedActive: boolean
  onSavedToggle: () => void
}

export default function BottomBar({
  searchValue,
  onSearchChange,
  onFilterOpen,
  isSavedActive,
  onSavedToggle,
}: BottomBarProps) {
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-3 py-2 flex items-center gap-2 z-30">
      {/* Search input */}
      <div className="flex-1 relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Filter */}
      <button onClick={onFilterOpen} className="text-gray-400 p-2">
        <span className="text-lg">⚙️</span>
      </button>

      {/* Wall */}
      <button onClick={() => navigate('/wall')} className="text-gray-400 p-2">
        <span className="text-lg">🖼️</span>
      </button>

      {/* Saved toggle */}
      <button
        onClick={onSavedToggle}
        className={`p-2 ${isSavedActive ? 'text-yellow-400' : 'text-gray-400'}`}
      >
        <span className="text-lg">⭐</span>
      </button>

      {/* Create */}
      <button
        onClick={() => navigate('/problems/new')}
        className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold flex-shrink-0"
      >
        +
      </button>
    </div>
  )
}
