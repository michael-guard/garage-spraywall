import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomBar from './components/BottomBar'
import HomePage from './pages/HomePage'
import WallPage from './pages/WallPage'
import CanvasTestPage from './pages/CanvasTestPage'
import CreateProblemPage from './pages/CreateProblemPage'

function AppContent() {
  const location = useLocation()
  const hideBottomBar = location.pathname === '/canvas-test' || location.pathname === '/problems/new'

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${hideBottomBar ? '' : 'pb-20'}`}>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wall" element={<WallPage />} />
        <Route path="/canvas-test" element={<CanvasTestPage />} />
        <Route path="/problems/new" element={<CreateProblemPage />} />
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
