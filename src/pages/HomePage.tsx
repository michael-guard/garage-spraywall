import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActiveWallPhoto, type WallPhoto } from '../lib/wallPhotos'

export default function HomePage() {
  const navigate = useNavigate()
  const [photo, setPhoto] = useState<WallPhoto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const active = await getActiveWallPhoto()
        setPhoto(active)
      } catch {
        // Silently fail — no toast needed for home page load
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  if (!photo) {
    return (
      <div className="flex flex-col items-center justify-center p-6 pt-20">
        <p className="text-gray-400 text-lg mb-4">No wall photo yet</p>
        <button
          onClick={() => navigate('/wall')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium"
        >
          Upload your first wall photo
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="p-4 pb-2">
        <h1 className="text-xl font-bold">Spray Wall Tracker</h1>
      </div>
      <div className="px-2">
        <img
          src={photo.image_url}
          alt="Active wall photo"
          className="w-full rounded-lg"
        />
      </div>
    </div>
  )
}
