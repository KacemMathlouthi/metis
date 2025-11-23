import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import './App.css'

function App() {
  const [showApp, setShowApp] = useState(false)

  const handleEnterApp = () => {
    setShowApp(true)
    // TODO: Navigate to main app dashboard
  }

  if (!showApp) {
    return <LandingPage onEnterApp={handleEnterApp} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCD34D]">
      <div className="text-center">
        <h1 className="text-6xl font-black mb-4">WELCOME TO METIS</h1>
        <p className="text-2xl font-bold">Dashboard coming soon...</p>
      </div>
    </div>
  )
}

export default App
