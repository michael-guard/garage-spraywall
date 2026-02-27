import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveWallPhoto, type WallPhoto } from '../lib/wallPhotos'
import WallCanvas from '../components/WallCanvas'
import type { Hold } from '../types'

export default function CanvasTestPage() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<WallPhoto | null>(null)
  const [holds, setHolds] = useState<Hold[]>([])
  const [loading, setLoading] = useState(true)

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
          ← Back
        </button>
        <span className="text-sm text-gray-300">
          Canvas Test — {holds.length} hold{holds.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setHolds([])}
          className="text-red-400 text-sm"
        >
          Clear
        </button>
      </div>

      {/* Canvas */}
      <WallCanvas
        imageUrl={photo.image_url}
        holds={holds}
        onHoldsChange={setHolds}
        mode="create-step1"
        darkOverlay
      />

      {/* Debug info */}
      <div className="p-3 bg-gray-900 text-xs text-gray-500">
        <p>Tap: place hold | Tap hold: remove | Double-tap hold: hand↔foot</p>
        <p>Pinch: zoom | Drag: pan | Drag edge: resize</p>
      </div>
    </div>
  )
}
