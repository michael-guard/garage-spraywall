import { useState } from 'react'
import { useModalA11y } from '../hooks/useModalA11y'

const GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10']

interface SendConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (grade: string, rating: number | null) => void
  initialGrade: string
  initialRating: number | null
  submitting: boolean
}

export default function SendConfirmModal({
  open,
  onClose,
  onConfirm,
  initialGrade,
  initialRating,
  submitting,
}: SendConfirmModalProps) {
  const [grade, setGrade] = useState(initialGrade)
  const [rating, setRating] = useState(initialRating)
  const panelRef = useModalA11y(open, onClose)

  const handleConfirm = () => {
    onConfirm(grade, rating)
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Log send"
        className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 rounded-t-2xl transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-4 space-y-5 pb-8">
          {/* Drag handle */}
          <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto" />

          <h2 className="text-white font-semibold text-center">Log Send</h2>

          {/* Grade */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Grade</label>
            <div className="flex gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGrade(g)}
                  aria-pressed={grade === g}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    grade === g
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(rating === star ? null : star)}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={rating !== null && star <= rating}
                  className="text-2xl w-10 h-10 flex items-center justify-center"
                >
                  {rating !== null && star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className={`w-full py-3 rounded-lg font-medium ${
              submitting ? 'bg-gray-700 text-gray-500' : 'bg-blue-600 text-white'
            }`}
          >
            {submitting ? 'Logging...' : 'Confirm Send'}
          </button>
        </div>
      </div>
    </>
  )
}
