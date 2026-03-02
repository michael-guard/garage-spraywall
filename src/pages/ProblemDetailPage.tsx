import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { fetchProblem, fromDbHolds, logSend, toggleSaved, archiveProblem } from '../lib/problems'
import type { Problem } from '../types'
import WallCanvas from '../components/WallCanvas'
import SendConfirmModal from '../components/SendConfirmModal'

const FEET_RULES_LABELS: Record<string, string> = {
  selected_only: 'Selected Feet Only',
  follow_hands: 'Feet Follow Hands',
  open: 'Open Feet',
}

export default function ProblemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [sendModalOpen, setSendModalOpen] = useState(false)
  const [sendSubmitting, setSendSubmitting] = useState(false)

  const loadProblem = useCallback(async () => {
    if (!id) return
    try {
      const data = await fetchProblem(id)
      setProblem(data)
    } catch {
      toast.error('Failed to load problem')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProblem()
  }, [loadProblem])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
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
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 bg-gray-900">
        <button onClick={() => navigate('/')} className="text-gray-400 text-sm">
          ← Back
        </button>
        <span className="text-sm text-white font-medium truncate mx-4">{problem.name}</span>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-400 text-sm px-2">
            ⋮
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 bg-gray-800 rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    handleArchive()
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                >
                  Archive
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Wall photo with holds */}
      <WallCanvas
        imageUrl={problem.wall_photo_url}
        holds={holdData.holds}
        startHoldIds={holdData.startHoldIds}
        finishHoldIds={holdData.finishHoldIds}
      />

      {/* Metadata */}
      <div className="p-4 space-y-4">
        {/* Grade + Status + Rating row */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{problem.grade}</span>
          {problem.status === 'project' && (
            <span className="bg-yellow-600 text-white text-xs px-2 py-0.5 rounded-full font-medium uppercase">
              Project
            </span>
          )}
          {problem.rating !== null && (
            <span className="text-yellow-500">{'★'.repeat(problem.rating)}</span>
          )}
          {problem.send_count > 0 && (
            <span className="text-gray-500 text-sm">{problem.send_count} send{problem.send_count !== 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-2 text-sm text-gray-400">
          <span className="bg-gray-800 px-2.5 py-1 rounded">{FEET_RULES_LABELS[problem.feet_rules] ?? problem.feet_rules}</span>
          <span className="bg-gray-800 px-2.5 py-1 rounded capitalize">{problem.start_type} start</span>
        </div>

        {/* Tags */}
        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {problem.tags.map((tag) => (
              <span key={tag} className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setSendModalOpen(true)}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium text-center"
          >
            ✓ Log Send
          </button>
          <button
            onClick={handleToggleSaved}
            className={`px-4 py-3 rounded-lg font-medium border ${
              problem.is_saved
                ? 'bg-yellow-600/20 border-yellow-600 text-yellow-400'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            {problem.is_saved ? '★' : '☆'}
          </button>
        </div>
      </div>

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
