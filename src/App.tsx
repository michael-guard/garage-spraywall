import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import HomePage from './pages/HomePage'
import WallPage from './pages/WallPage'
import CanvasTestPage from './pages/CanvasTestPage'
import CreateProblemPage from './pages/CreateProblemPage'
import ProblemDetailPage from './pages/ProblemDetailPage'
import ErrorBoundary from './components/ErrorBoundary'

function AppContent() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Toaster
        position="top-center"
        toastOptions={{
          ariaProps: { role: 'status', 'aria-live': 'polite' },
        }}
      />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wall" element={<WallPage />} />
          <Route path="/canvas-test" element={<CanvasTestPage />} />
          <Route path="/problems/new" element={<CreateProblemPage />} />
          <Route path="/problems/:id" element={<ProblemDetailPage />} />
        </Routes>
      </ErrorBoundary>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
