import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomBar from './components/BottomBar'
import HomePage from './pages/HomePage'
import WallPage from './pages/WallPage'
import CanvasTestPage from './pages/CanvasTestPage'

function AppContent() {
  const location = useLocation()
  const hideBottomBar = location.pathname === '/canvas-test'

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${hideBottomBar ? '' : 'pb-20'}`}>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wall" element={<WallPage />} />
        <Route path="/canvas-test" element={<CanvasTestPage />} />
      </Routes>
      {!hideBottomBar && <BottomBar />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
