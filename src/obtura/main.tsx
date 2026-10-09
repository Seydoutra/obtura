import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'
import { Platform } from './App'
import { AuthPage, StudioPage } from './Auth'
import { client } from './client'
import { Landing } from './Landing'
import { Demo } from './Demo'
import './styles.css'
import './landing.css'
import './photo-experience.css'
import './face-discovery.css'
import './demo.css'
import './auth.css'

function Root() {
  const [route, setRoute] = useState(window.location.hash.slice(1))
  useEffect(() => {
    const update = () => setRoute(window.location.hash.slice(1))
    window.addEventListener('hashchange', update)
    const arrivingFromEmail = window.location.hash.includes('access_token=') || new URLSearchParams(window.location.search).has('code')
    let handledEmailRedirect = false
    const listener = client?.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') { handledEmailRedirect = true; window.location.hash = '#/reset-password' }
      else if (event === 'SIGNED_IN' && arrivingFromEmail && !handledEmailRedirect) { handledEmailRedirect = true; window.location.hash = '#/studio' }
    })
    return () => { window.removeEventListener('hashchange', update); listener?.data.subscription.unsubscribe() }
  }, [])
  if (route.startsWith('/demo')) return <Demo />
  if (route === '/login' || route === '/signup' || route === '/forgot-password' || route === '/reset-password') return <AuthPage mode={route.slice(1) as 'login' | 'signup' | 'forgot-password' | 'reset-password'} />
  if (route === '/studio') return <StudioPage />
  return <Landing platform={<Platform />} />
}

createRoot(document.getElementById('root')!).render(<Root />)
