import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchProblem, fromDbHolds, logSend, toggleSaved, archiveProblem, updateProblem } from '../lib/problems'
import type { Problem } from '../types'
import WallCanvas from '../components/WallCanvas'
import SendConfirmModal from '../components/SendConfirmModal'
import Skeleton from '../components/Skeleton'

const FEET_RULES_LABELS: Record<string, string> = {
  selected_only: 'Selected Feet Only',
  follow_hands: 'Feet Follow Hands',
  open: 'Open Feet',
}

const GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']

const TAGS = [
  'Compression', 'Crimpy', 'Cut Feet', 'Dead Point',
  'Dyno', 'Juggy', 'Layback', 'Lock Off',
  'Pinchy', 'Pocket', 'Powerful', 'Pumpy',
  'Reachy', 'Slopey', 'Technical', 'Undercling',
]

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [sendSubmitting, setSendSubmitting] = useState(false)
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editGrade, setEditGrade] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [editSaving, setEditSaving] = useState(false)

  const loadProblem = useCallback(async () => {
    if (!id) return
    setError(false)
    try {
      const data = await fetchProblem(id)
      setProblem(data)
    } catch {
      setError(true)
      toast.error('Failed to load problem')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    window.scrollTo(0, 0)
    loadProblem()
  }, [loadProblem])

  // Escape key to close dropdown menu
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [menuOpen])

  // Convert DB holds to UI format
  const holdData = useMemo(() => {
    if (!problem) return null
    return fromDbHolds(problem.holds)
  }, [problem])

  // Send logging
  const handleSendConfirm = async (grade: string, rating: number | null) => {
    if (!problem) return
    setSendSubmitting(true)
    try {
      await logSend(problem.id, { grade, rating })
      toast.success('Send logged!')
      setSendModalOpen(false)
      loadProblem() // Refresh to update send count + status
    } catch {
      toast.error('Failed to log send')
    } finally {
      setSendSubmitting(false)
    }
  }

  // Bookmark toggle
  const handleToggleSaved = async () => {
    if (!problem) return
    try {
      await toggleSaved(problem.id, !problem.is_saved)
      setProblem({ ...problem, is_saved: !problem.is_saved })
    } catch {
      toast.error('Failed to update saved')
    }
  }

  // Archive
  const handleArchive = async () => {
    if (!problem) return
    try {
      await archiveProblem(problem.id)
      toast.success('Problem archived')
      navigate('/')
    } catch {
      toast.error('Failed to archive')
    }
  }

  const enterEditMode = () => {
    if (!problem) return
    setEditGrade(problem.grade)
    setEditTags([...problem.tags])
    setEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!problem) return
    setEditSaving(true)
    try {
      await updateProblem(problem.id, { grade: editGrade, tags: editTags })
      setProblem({ ...problem, grade: editGrade, tags: editTags })
      toast.success('Problem updated')
      setEditing(false)
    } catch {
      toast.error('Failed to update')
    } finally {
      setEditSaving(false)
    }
  }

  const toggleEditTag = (tag: string) => {
    setEditTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  if (loading) {
    return (
      <div className="h-dvh flex flex-col overflow-hidden bg-gray-950 text-white">
        <div className="flex items-center justify-between p-3 bg-gray-900">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="flex flex-col items-center gap-2 px-4 pt-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-16" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-24 rounded" />
            <Skeleton className="h-6 w-20 rounded" />
          </div>
        </div>
        <div className="flex-1 min-h-0 m-3">
          <Skeleton className="h-full w-full rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">Failed to load problem</p>
        <button onClick={loadProblem} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  if (!problem || !holdData) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">Problem not found</p>
        <button onClick={() => navigate('/')} className="text-blue-400">
          Back to list
        </button>
      </div>
    )
  }

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 bg-gray-900">
        {editing ? (
          <>
            <button onClick={() => setEditing(false)} className="text-gray-400 text-base min-w-[60px]">
              Back
            </button>
            <div className="min-w-[60px]" />
            <button
              onClick={handleSaveEdit}
              disabled={editSaving}
              className="text-blue-400 text-base font-medium min-w-[60px] text-right disabled:opacity-50"
            >
              {editSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/')} className="text-gray-400 text-base min-w-[60px]" aria-label="Back to problem list">
              Back
            </button>
            <div className="min-w-[60px]" />
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 text-base px-2" aria-label="Problem menu">
                ⋮
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 bg-gray-800 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        enterEditMode()
                      }}
                      className="w-full text-left px-4 py-2 text-base text-white hover:bg-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setArchiveConfirmOpen(true)
                      }}
                      className="w-full text-left px-4 py-2 text-base text-red-400 hover:bg-gray-700"
                    >
                      Archive
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {editing ? (
        /* Edit mode form */
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6">
          {/* Problem name (read-only header) */}
          <h1 className="text-lg font-bold text-center">{problem.name}</h1>

          {/* Grade (editable) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Grade</label>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setEditGrade(g)}
                  aria-pressed={editGrade === g}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    editGrade === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Style Tags (editable) */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Style Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleEditTag(tag)}
                  aria-pressed={editTags.includes(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    editTags.includes(tag)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Name (disabled) */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={problem.name}
              readOnly
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white"
            />
          </div>

          {/* Start Type (disabled) */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm text-gray-400 mb-2">Start Type</label>
            <div className="flex bg-gray-800 rounded-full p-1 w-fit">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                problem.start_type === 'sit' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}>Sit</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                problem.start_type === 'stand' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}>Stand</span>
            </div>
          </div>

          {/* Status (disabled) */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <div className="flex bg-gray-800 rounded-full p-1 w-fit">
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                problem.status === 'project' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}>Project</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                problem.status === 'active' ? 'bg-blue-600 text-white' : 'text-gray-400'
              }`}>Sent</span>
            </div>
          </div>

          {/* Rating (disabled, only if exists) */}
          {problem.rating !== null && (
            <div className="opacity-50 pointer-events-none">
              <label className="block text-sm text-gray-400 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3].map((star) => (
                  <span key={star} className="text-2xl w-10 h-10 flex items-center justify-center">
                    {problem.rating !== null && star <= problem.rating ? '⭐' : '☆'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feet Rules (disabled) */}
          <div className="opacity-50 pointer-events-none">
            <label className="block text-sm text-gray-400 mb-2">Feet Rules</label>
            <span className="bg-gray-800 text-gray-400 px-3 py-1.5 rounded-full text-sm">
              {FEET_RULES_LABELS[problem.feet_rules] ?? problem.feet_rules}
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Problem name */}
          <h1 className="text-lg font-bold text-center px-4 pt-2">{problem.name}</h1>

          {/* Grade + stars + send count */}
          <div className="flex items-center justify-center gap-3 py-1">
            <span className="text-xl font-bold">{problem.grade}</span>
            {problem.status === 'project' && (
              <span className="bg-yellow-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase">
                Project
              </span>
            )}
            {problem.rating !== null && (
              <span className="text-yellow-500 text-sm">{'★'.repeat(problem.rating)}</span>
            )}
            {problem.send_count > 0 && (
              <span className="text-gray-500 text-sm">{problem.send_count}x</span>
            )}
          </div>

          {/* Info chips: feet rules → start type → tags */}
          <div className="flex flex-wrap justify-center gap-1.5 px-4 pb-2">
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
              {FEET_RULES_LABELS[problem.feet_rules] ?? problem.feet_rules}
            </span>
            <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded capitalize">
              {problem.start_type} start
            </span>
            {problem.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* Wall photo with holds — fills remaining space, centered vertically */}
          <div className="flex-1 min-h-0 overflow-hidden flex items-center justify-center">
            <WallCanvas
              imageUrl={problem.wall_photo_url}
              holds={holdData.holds}
              startHoldIds={holdData.startHoldIds}
              finishHoldIds={holdData.finishHoldIds}
              darkOverlay
            />
          </div>

          {/* Fixed bottom action bar: favorite left, log send right */}
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex gap-3 px-4 pt-2 z-30" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
            <button
              onClick={handleToggleSaved}
              aria-label={problem.is_saved ? 'Remove from saved' : 'Save problem'}
              aria-pressed={problem.is_saved}
              className={`px-4 py-3 rounded-lg font-medium border ${
                problem.is_saved
                  ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              {problem.is_saved ? '★' : '☆'}
            </button>
            <button
              onClick={() => setSendModalOpen(true)}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium text-center"
            >
              Log Send
            </button>
          </div>
        </>
      )}

      {/* Archive confirm modal */}
      {archiveConfirmOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-50" onClick={() => setArchiveConfirmOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-xs">
              <p className="text-center text-white mb-6">Are you sure you want to archive?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setArchiveConfirmOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setArchiveConfirmOpen(false)
                    handleArchive()
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-600 text-white"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Send confirm modal */}
      <SendConfirmModal
        open={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onConfirm={handleSendConfirm}
        initialGrade={problem.grade}
        initialRating={problem.rating}
        submitting={sendSubmitting}
      />
    </div>
  )
}
