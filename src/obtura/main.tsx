import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import { Platform } from './App'
import { Landing } from './Landing'
import { Demo } from './Demo'
import './styles.css'
import './landing.css'
import './demo.css'

function Root() {
  const [inDemo, setInDemo] = useState(window.location.hash.startsWith('#/demo'))
  useEffect(() => {
    const update = () => setInDemo(window.location.hash.startsWith('#/demo'))
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  return inDemo ? <Demo /> : <Landing platform={<Platform />} />
}

createRoot(document.getElementById('root')!).render(<Root />)
