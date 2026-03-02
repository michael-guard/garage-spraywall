import type { SortOption } from '../lib/problems'

const GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'best', label: 'Best' },
  { value: 'most_repeats', label: 'Most Repeats' },
  { value: 'least_repeats', label: 'Least Repeats' },
]

interface FilterSortPanelProps {
  open: boolean
  onClose: () => void
  resultCount: number
  minGrade: string
  maxGrade: string
  onMinGradeChange: (grade: string) => void
  onMaxGradeChange: (grade: string) => void
  projectsOnly: boolean
  onProjectsOnlyChange: (on: boolean) => void
  savedOnly: boolean
  onSavedOnlyChange: (on: boolean) => void
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  onReset: () => void
}

export default function FilterSortPanel({
  open,
  onClose,
  resultCount,
  minGrade,
  maxGrade,
  onMinGradeChange,
  onMaxGradeChange,
  projectsOnly,
  onProjectsOnlyChange,
  savedOnly,
  onSavedOnlyChange,
  sort,
  onSortChange,
  onReset,
}: FilterSortPanelProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-4 space-y-5 max-h-[80vh] overflow-y-auto pb-8">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto" />

          {/* Header */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">{resultCount} problems</span>
            <button onClick={onReset} className="text-blue-400 text-sm">
              Reset
            </button>
          </div>

          {/* Difficulty — Min */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Min Difficulty</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => onMinGradeChange(minGrade === g ? '' : g)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    minGrade === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty — Max */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Max Difficulty</label>
            <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => onMaxGradeChange(maxGrade === g ? '' : g)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    maxGrade === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-3">
            <button
              onClick={() => onProjectsOnlyChange(!projectsOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                projectsOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              Projects Only
            </button>
            <button
              onClick={() => onSavedOnlyChange(!savedOnly)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                savedOnly
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}
            >
              Saved Only
            </button>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Sort</label>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSortChange(opt.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    sort === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Show Results */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
          >
            Show {resultCount} problems
          </button>
        </div>
      </div>
    </>
  )
}
