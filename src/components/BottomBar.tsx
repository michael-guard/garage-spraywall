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
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 px-3 pt-2 z-30" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      {/* Search input */}
      <div className="relative mb-2">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" aria-hidden="true">🔍</span>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search"
          aria-label="Search problems"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Buttons row */}
      <div className="flex items-center justify-around">
        {/* Wall photo uploader */}
        <button onClick={() => navigate('/wall')} className="text-gray-400 p-2" aria-label="Wall photos">
          <span className="text-xl" aria-hidden="true">🖼️</span>
        </button>

        {/* Saved / favorites toggle */}
        <button
          onClick={onSavedToggle}
          aria-label={isSavedActive ? 'Show all problems' : 'Show saved only'}
          aria-pressed={isSavedActive}
          className={`p-2 ${isSavedActive ? 'text-yellow-400' : 'text-gray-400'}`}
        >
          <span className="text-xl" aria-hidden="true">⭐</span>
        </button>

        {/* Filter */}
        <button onClick={onFilterOpen} className="text-gray-400 p-2" aria-label="Filters">
          <span className="text-xl" aria-hidden="true">⚙️</span>
        </button>

        {/* Create problem */}
        <button
          onClick={() => navigate('/problems/new')}
          aria-label="Create new problem"
          className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold flex-shrink-0"
        >
          +
        </button>
      </div>
    </nav>
  )
}
