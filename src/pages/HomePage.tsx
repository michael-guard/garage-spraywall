import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchProblems, type SortOption } from '../lib/problems'
import type { ProblemListItem } from '../types'
import ProblemRow from '../components/ProblemRow'
import BottomBar from '../components/BottomBar'
import FilterSortPanel from '../components/FilterSortPanel'

export default function HomePage() {
  const navigate = useNavigate()

  // Problem data
  const [problems, setProblems] = useState<ProblemListItem[]>([])
  const [loading, setLoading] = useState(true)

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
      toast.error('Failed to load problems')
    } finally {
      setLoading(false)
    }
  }, [search, minGrade, maxGrade, projectsOnly, savedOnly, sort])

  useEffect(() => {
    loadProblems()
  }, [loadProblems])

  const handleProblemTap = (id: string) => {
    navigate(`/problems/${id}`)
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
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-white">My Problems</h1>
      </div>

      {/* Problem list */}
      {loading ? (
        <p className="text-gray-400 px-4 py-8">Loading...</p>
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
        onMinGradeChange={setMinGrade}
        onMaxGradeChange={setMaxGrade}
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
