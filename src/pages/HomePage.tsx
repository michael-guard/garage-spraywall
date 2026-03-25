import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchProblems, type SortOption } from '../lib/problems'
import type { ProblemListItem } from '../types'
import ProblemRow from '../components/ProblemRow'
import BottomBar from '../components/BottomBar'
import FilterSortPanel from '../components/FilterSortPanel'
import Skeleton from '../components/Skeleton'

export default function HomePage() {
  const navigate = useNavigate()

  // Problem data
  const [problems, setProblems] = useState<ProblemListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Search + filter state
  const [search, setSearch] = useState('')
  const [minGrade, setMinGrade] = useState('')
  const [maxGrade, setMaxGrade] = useState('')
  const [projectsOnly, setProjectsOnly] = useState(false)
  const [savedOnly, setSavedOnly] = useState(false)
  const [sort, setSort] = useState<SortOption>('newest')
  const [filterOpen, setFilterOpen] = useState(false)

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
    setSavedOnly((prev) => !prev)
  }

  const handleResetFilters = () => {
    setSearch('')
    setMinGrade('')
    setMaxGrade('')
    setProjectsOnly(false)
    setSavedOnly(false)
    setSort('newest')
  }

  const hasActiveFilters = search || minGrade || maxGrade || projectsOnly || savedOnly

  return (
    <div className="pb-20">
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
        onSearchChange={setSearch}
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
          setMinGrade(g)
          if (g && maxGrade) {
            const gi = parseInt(g.slice(1)), maxi = parseInt(maxGrade.slice(1))
            if (gi > maxi) setMaxGrade(g)
          }
        }}
        onMaxGradeChange={(g) => {
          setMaxGrade(g)
          if (g && minGrade) {
            const gi = parseInt(g.slice(1)), mini = parseInt(minGrade.slice(1))
            if (gi < mini) setMinGrade(g)
          }
        }}
        projectsOnly={projectsOnly}
        onProjectsOnlyChange={setProjectsOnly}
        savedOnly={savedOnly}
        onSavedOnlyChange={setSavedOnly}
        sort={sort}
        onSortChange={setSort}
        onReset={handleResetFilters}
      />
    </div>
  )
}
