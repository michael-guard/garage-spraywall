import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import BottomBar from './components/BottomBar'
import HomePage from './pages/HomePage'
import WallPage from './pages/WallPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-950 text-white pb-20">
        <Toaster position="top-center" />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wall" element={<WallPage />} />
        </Routes>
        <BottomBar />
      </div>
    </BrowserRouter>
  )
}
