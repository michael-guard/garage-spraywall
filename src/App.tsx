import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import WallPage from './pages/WallPage'
import CanvasTestPage from './pages/CanvasTestPage'
import CreateProblemPage from './pages/CreateProblemPage'

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/wall" element={<WallPage />} />
        <Route path="/canvas-test" element={<CanvasTestPage />} />
        <Route path="/problems/new" element={<CreateProblemPage />} />
        <Route path="/problems/:id" element={<div className="p-6 text-gray-400">Problem detail coming soon</div>} />
      </Routes>
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
