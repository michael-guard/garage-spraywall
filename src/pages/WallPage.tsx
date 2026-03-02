import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { uploadWallPhoto, getWallPhotos, type WallPhoto } from '../lib/wallPhotos'
import Skeleton from '../components/Skeleton'

export default function WallPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<WallPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    setError(false)
    try {
      const data = await getWallPhotos()
      setPhotos(data)
    } catch {
      setError(true)
      toast.error('Failed to load wall photos')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await uploadWallPhoto(file)
      toast.success('Wall photo uploaded')
      await loadPhotos()
    } catch {
      toast.error('Failed to upload photo')
    } finally {
      setUploading(false)
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const activePhoto = photos.find((p) => p.is_active)

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gray-950 text-white">
      <div className="flex items-center justify-between p-3 bg-gray-900">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 text-base min-w-[60px]"
        >
          Back
        </button>
        <h1 className="text-base text-gray-300">Wall Photos</h1>
        <div className="min-w-[60px]" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {loading && (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <Skeleton className="w-full h-48" />
            <div className="p-3">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-gray-400 mb-4">Failed to load wall photos</p>
            <button onClick={loadPhotos} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && !activePhoto && (
          <p className="text-gray-400 text-center py-8">
            No active wall photo
          </p>
        )}

        {!loading && !error && activePhoto && (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <img
              src={activePhoto.image_url}
              alt={`Wall photo from ${new Date(activePhoto.uploaded_at).toLocaleDateString()}`}
              className="w-full"
            />
            <div className="p-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                {new Date(activePhoto.uploaded_at).toLocaleDateString()}
              </span>
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-900 border-t border-gray-700 px-4 pt-2" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload New Photo'}
        </button>
      </div>
    </div>
  )
}
