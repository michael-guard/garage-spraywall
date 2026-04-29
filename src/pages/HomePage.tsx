import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchProblems, type SortOption } from '../lib/problems'
import type { ProblemListItem } from '../types'
import ProblemRow from '../components/ProblemRow'
import BottomBar from '../components/BottomBar'
import FilterSortPanel from '../components/FilterSortPanel'
import Skeleton from '../components/Skeleton'

const SORT_OPTIONS: readonly SortOption[] = [
  'easiest',
  'best',
  'newest',
  'oldest',
  'most_repeats',
  'least_repeats',
]

function isValidSort(v: string | null): v is SortOption {
  return v !== null && (SORT_OPTIONS as readonly string[]).includes(v)
}

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Problem data
  const [problems, setProblems] = useState<ProblemListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Search + filter state derived from URL
  const search = searchParams.get('q') ?? ''
  const minGrade = searchParams.get('min') ?? ''
  const maxGrade = searchParams.get('max') ?? ''
  const projectsOnly = searchParams.get('proj') === '1'
  const savedOnly = searchParams.get('saved') === '1'
  const sortParam = searchParams.get('sort')
  const sort: SortOption = isValidSort(sortParam) ? sortParam : 'easiest'

  const [filterOpen, setFilterOpen] = useState(false)

  const updateParams = useCallback(
    (patch: Record<string, string | boolean | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [k, v] of Object.entries(patch)) {
            const str = v === true ? '1' : v === false ? null : v
            if (str == null || str === '') next.delete(k)
            else next.set(k, str)
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  // Load problems whenever filters change
  const loadProblems = useCallback(async () => {
    setError(false)
    try {
      const data = await fetchProblems({
        search,
        minGrade: minGrade || undefined,
        maxGrade: maxGrade || undefined,
        projectsOnly,
        savedOnly,
        sort,
      })
      setProblems(data)
    } catch {
      setError(true)
      toast.error('Failed to load problems')
    } finally {
      setLoading(false)
    }
  }, [search, minGrade, maxGrade, projectsOnly, savedOnly, sort])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  const handleProblemTap = (id: string) => {
    const problemIds = problems.map((p) => p.id)
    const currentIndex = problemIds.indexOf(id)
    navigate(`/problems/${id}`, { state: { problemIds, currentIndex } })
  }

  const handleSavedToggle = () => {
    updateParams({ saved: !savedOnly })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const hasActiveFilters = search || minGrade || maxGrade || projectsOnly || savedOnly

  return (
    <div style={{ paddingBottom: 'calc(max(0.75rem, env(safe-area-inset-bottom)) + 8.5rem)' }}>
      {/* Problem list */}
      {loading ? (
        <div className="divide-y divide-gray-800">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-gray-400 mb-4">Failed to load problems</p>
          <button onClick={loadProblems} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Retry
          </button>
        </div>
      ) : problems.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-gray-500 mb-2">No problems found</p>
          <p className="text-gray-600 text-sm">
            {hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Tap + to create your first problem'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {problems.map((problem) => (
            <ProblemRow key={problem.id} problem={problem} onTap={handleProblemTap} />
          ))}
        </div>
      )}

      {/* Bottom bar */}
      <BottomBar
        searchValue={search}
        onSearchChange={(v) => updateParams({ q: v })}
        onFilterOpen={() => setFilterOpen(true)}
        isSavedActive={savedOnly}
        onSavedToggle={handleSavedToggle}
      />

      {/* Filter panel */}
      <FilterSortPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        resultCount={problems.length}
        minGrade={minGrade}
        maxGrade={maxGrade}
        onMinGradeChange={(g) => {
          const patch: Record<string, string> = { min: g }
          if (g && maxGrade) {
            const gi = parseInt(g.slice(1)), maxi = parseInt(maxGrade.slice(1))
            if (gi > maxi) patch.max = g
          }
          updateParams(patch)
        }}
        onMaxGradeChange={(g) => {
          const patch: Record<string, string> = { max: g }
          if (g && minGrade) {
            const gi = parseInt(g.slice(1)), mini = parseInt(minGrade.slice(1))
            if (gi < mini) patch.min = g
          }
          updateParams(patch)
        }}
        projectsOnly={projectsOnly}
        onProjectsOnlyChange={(v) => updateParams({ proj: v })}
        savedOnly={savedOnly}
        onSavedOnlyChange={(v) => updateParams({ saved: v })}
        sort={sort}
        onSortChange={(v) => updateParams({ sort: v === 'easiest' ? null : v })}
        onReset={handleResetFilters}
      />
    </div>
  )
}
