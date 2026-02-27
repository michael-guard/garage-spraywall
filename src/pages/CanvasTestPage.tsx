import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveWallPhoto, type WallPhoto } from '../lib/wallPhotos'
import WallCanvas from '../components/WallCanvas'
import DrawToolbar from '../components/DrawToolbar'
import { useUndoRedo } from '../hooks/useUndoRedo'

export default function CanvasTestPage() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<WallPhoto | null>(null)
  const [loading, setLoading] = useState(true)
  const [holdType, setHoldType] = useState<'hand' | 'foot'>('hand')
  const [strokeWidth, setStrokeWidth] = useState(3)

  const { holds, addHold, undo, redo, canUndo, canRedo, clearAll } = useUndoRedo()

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

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between p-3 bg-gray-900">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 text-sm"
        >
          &larr; Back
        </button>
        <span className="text-sm text-gray-300">
          Canvas Test &mdash; {holds.length} shape{holds.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={clearAll}
          className="text-red-400 text-sm"
        >
          Clear All
        </button>
      </div>

      {/* Canvas */}
      <WallCanvas
        imageUrl={photo.image_url}
        holds={holds}
        onAddHold={addHold}
        holdType={holdType}
        strokeWidth={strokeWidth}
        darkOverlay
      />

      {/* Floating toolbar */}
      <DrawToolbar
        holdType={holdType}
        onHoldTypeChange={setHoldType}
        strokeWidth={strokeWidth}
        onStrokeWidthChange={setStrokeWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />
    </div>
  )
}
