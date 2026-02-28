import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getActiveWallPhoto, type WallPhoto } from '../lib/wallPhotos'
import { createProblem } from '../lib/problems'
import { useUndoRedo } from '../hooks/useUndoRedo'
import WallCanvas from '../components/WallCanvas'
import DrawToolbar from '../components/DrawToolbar'
import FeetRulesToggle from '../components/FeetRulesToggle'
import MetadataForm from '../components/MetadataForm'
import type { FeetRules } from '../types'

export default function CreateProblemPage() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<WallPhoto | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [publishing, setPublishing] = useState(false)

  // Step 1: drawing
  const [holdType, setHoldType] = useState<'hand' | 'foot'>('hand')
  const [feetRules, setFeetRules] = useState<FeetRules>('selected_only')
  const { holds, addHold, undo, redo, canUndo, canRedo } = useUndoRedo()

  // Step 2: start holds
  const [startHoldIds, setStartHoldIds] = useState<Set<string>>(new Set())

  // Step 3: finish holds
  const [finishHoldIds, setFinishHoldIds] = useState<Set<string>>(new Set())

  // Step 4: metadata
  const [name, setName] = useState('')
  const [grade, setGrade] = useState('')
  const [moveCount, setMoveCount] = useState<number | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [startType, setStartType] = useState<'sit' | 'stand'>('sit')
  const [status, setStatus] = useState<'project' | 'sent'>('project')
  const [rating, setRating] = useState<number | null>(null)

  // Load active photo
  useEffect(() => {
    async function load() {
      try {
        const active = await getActiveWallPhoto()
        setPhoto(active)
      } catch {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Computed: hand hold IDs for step 2 tapping
  const handHoldIds = useMemo(
    () => new Set(holds.filter((h) => h.type === 'hand').map((h) => h.id)),
    [holds]
  )

  // Computed: non-start hand hold IDs for step 3 tapping
  const finishTappableIds = useMemo(
    () => new Set([...handHoldIds].filter((id) => !startHoldIds.has(id))),
    [handHoldIds, startHoldIds]
  )

  // Validation
  const canAdvance = useMemo(() => {
    switch (step) {
      case 1: return holds.length >= 1
      case 2: return startHoldIds.size >= 1
      case 3: return finishHoldIds.size >= 1
      case 4: return name.trim() !== '' && grade !== ''
      default: return false
    }
  }, [step, holds.length, startHoldIds.size, finishHoldIds.size, name, grade])

  // Clean up stale IDs when advancing from step 1
  const handleNext = useCallback(() => {
    if (step === 1) {
      // Remove any start/finish IDs that reference deleted holds
      const holdIdSet = new Set(holds.map((h) => h.id))
      setStartHoldIds((prev) => {
        const cleaned = new Set([...prev].filter((id) => holdIdSet.has(id)))
        return cleaned.size !== prev.size ? cleaned : prev
      })
      setFinishHoldIds((prev) => {
        const cleaned = new Set([...prev].filter((id) => holdIdSet.has(id)))
        return cleaned.size !== prev.size ? cleaned : prev
      })
    }
    setStep((s) => s + 1)
  }, [step, holds])

  // Step 2: toggle start hold
  const handleStartToggle = useCallback((holdId: string) => {
    setStartHoldIds((prev) => {
      const next = new Set(prev)
      if (next.has(holdId)) {
        next.delete(holdId)
      } else if (next.size < 2) {
        next.add(holdId)
      }
      return next
    })
  }, [])

  // Step 3: toggle finish hold
  const handleFinishToggle = useCallback((holdId: string) => {
    setFinishHoldIds((prev) => {
      const next = new Set(prev)
      if (next.has(holdId)) {
        next.delete(holdId)
      } else if (next.size < 2) {
        next.add(holdId)
      }
      return next
    })
  }, [])

  // Publish
  const handlePublish = async () => {
    if (!photo || publishing) return
    setPublishing(true)
    try {
      await createProblem({
        wallPhotoId: photo.id,
        name: name.trim(),
        grade,
        moveCount,
        holds,
        startHoldIds,
        finishHoldIds,
        feetRules,
        startType,
        status,
        rating,
        tags,
      })
      toast.success('Problem created!')
      navigate('/')
    } catch {
      toast.error('Failed to create problem')
    } finally {
      setPublishing(false)
    }
  }

  // --- Loading / no photo states ---

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-gray-400 mb-4">No wall photo found</p>
        <button
          onClick={() => navigate('/wall')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Upload a photo first
        </button>
      </div>
    )
  }

  // --- Step labels ---
  const stepLabels = ['Select Holds', 'Select Starts', 'Select Finishes', 'Details']

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Wizard nav bar */}
      <div className="flex items-center justify-between p-3 bg-gray-900">
        {/* Left: X or Back */}
        <button
          onClick={() => (step === 1 ? navigate('/') : setStep((s) => s - 1))}
          className="text-gray-400 text-sm min-w-[60px]"
        >
          {step === 1 ? '✕ Cancel' : '← Back'}
        </button>

        {/* Center: step indicator */}
        <span className="text-sm text-gray-300">
          {stepLabels[step - 1]} ({step}/4)
        </span>

        {/* Right: Next or Publish */}
        {step < 4 ? (
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className={`text-sm font-medium min-w-[60px] text-right ${
              canAdvance ? 'text-blue-400' : 'text-gray-600'
            }`}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handlePublish}
            disabled={!canAdvance || publishing}
            className={`text-sm font-medium min-w-[60px] text-right ${
              canAdvance && !publishing ? 'text-blue-400' : 'text-gray-600'
            }`}
          >
            {publishing ? 'Saving...' : 'Publish'}
          </button>
        )}
      </div>

      {/* Step content */}
      {step === 1 && (
        <>
          <WallCanvas
            imageUrl={photo.image_url}
            holds={holds}
            onAddHold={addHold}
            holdType={holdType}
            darkOverlay
          />
          <FeetRulesToggle value={feetRules} onChange={setFeetRules} />
          <DrawToolbar
            holdType={holdType}
            onHoldTypeChange={setHoldType}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
          />
        </>
      )}

      {step === 2 && (
        <>
          <WallCanvas
            imageUrl={photo.image_url}
            holds={holds}
            onHoldTap={handleStartToggle}
            tappableHoldIds={handHoldIds}
            startHoldIds={startHoldIds}
            finishHoldIds={finishHoldIds}
            darkOverlay
          />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-sm text-gray-300">
              Tap hand holds to select starts (max 2)
            </span>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <WallCanvas
            imageUrl={photo.image_url}
            holds={holds}
            onHoldTap={handleFinishToggle}
            tappableHoldIds={finishTappableIds}
            startHoldIds={startHoldIds}
            finishHoldIds={finishHoldIds}
            darkOverlay
          />
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900/80 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-sm text-gray-300">
              Tap hand holds to select finishes (max 2)
            </span>
          </div>
        </>
      )}

      {step === 4 && (
        <MetadataForm
          name={name}
          onNameChange={setName}
          grade={grade}
          onGradeChange={setGrade}
          moveCount={moveCount}
          onMoveCountChange={setMoveCount}
          tags={tags}
          onTagsChange={setTags}
          startType={startType}
          onStartTypeChange={setStartType}
          status={status}
          onStatusChange={setStatus}
          rating={rating}
          onRatingChange={setRating}
        />
      )}
    </div>
  )
}
