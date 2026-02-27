import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { uploadWallPhoto, getWallPhotos, type WallPhoto } from '../lib/wallPhotos'

export default function WallPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<WallPhoto[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPhotos()
  }, [])

  async function loadPhotos() {
    try {
      const data = await getWallPhotos()
      setPhotos(data)
    } catch {
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

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 text-lg"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">Wall Photos</h1>
        <div className="w-12" /> {/* spacer */}
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium mb-6 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload New Photo'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && photos.length === 0 && (
        <p className="text-gray-400 text-center py-8">
          No wall photos uploaded yet
        </p>
      )}

      <div className="space-y-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="bg-gray-900 rounded-lg overflow-hidden"
          >
            <img
              src={photo.image_url}
              alt="Wall photo"
              className="w-full"
            />
            <div className="p-3 flex items-center justify-between">
              <span className="text-gray-400 text-sm">
                {new Date(photo.uploaded_at).toLocaleDateString()}
              </span>
              {photo.is_active && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
