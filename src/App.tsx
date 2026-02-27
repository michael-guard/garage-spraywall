import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import BottomBar from './components/BottomBar'

export default function App() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [photoCount, setPhotoCount] = useState(0)

  useEffect(() => {
    async function checkConnection() {
      try {
        const { count, error } = await supabase
          .from('wall_photos')
          .select('*', { count: 'exact', head: true })

        if (error) throw error
        setPhotoCount(count ?? 0)
        setStatus('connected')
      } catch {
        setStatus('error')
      }
    }
    checkConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <Toaster position="top-center" />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Spray Wall Tracker</h1>

        {status === 'loading' && (
          <p className="text-gray-400">Connecting to Supabase...</p>
        )}

        {status === 'connected' && (
          <div className="space-y-2">
            <p className="text-green-400">Connected to Supabase</p>
            <p className="text-gray-400">
              {photoCount} wall photo{photoCount !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {status === 'error' && (
          <p className="text-red-400">
            Failed to connect to Supabase. Check your environment variables.
          </p>
        )}
      </div>

      <BottomBar />
    </div>
  )
}
