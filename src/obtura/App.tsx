import { useEffect, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import { ArrowRight, Aperture, CalendarDays, Images, Layers3, LockKeyhole, LogOut, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { client } from './client'

type Studio = { id: string; name: string; slug: string }

const features = [
  { icon: CalendarDays, title: 'Book', detail: 'Du premier contact au rendez-vous confirmé.' },
  { icon: Layers3, title: 'Studio', detail: 'Clients, projets et équipe dans un même espace.' },
  { icon: Images, title: 'Galleries', detail: 'Une livraison privée, conçue pour vos images.' },
]

function Brand() {
  return <span className="brand"><span className="brand-mark"><Aperture size={22} strokeWidth={1.7} /></span>obtura<span className="brand-dot">.</span></span>
}

export function Platform() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(client))
  const [studios, setStudios] = useState<Studio[]>([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [studioName, setStudioName] = useState('')
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!client) return
    let active = true
    void client.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setLoading(false) }
    })
    const { data } = client.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!client || !session) { setStudios([]); return }
    let active = true
    void client.from('organizations').select('id,name,slug').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (error) setNotice('Les studios ne sont pas disponibles. Vérifiez que la migration Obtura est appliquée.')
      else setStudios((data || []) as Studio[])
    })
    return () => { active = false }
  }, [session?.user.id])

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client) return
    setBusy(true); setNotice('')
    const result = mode === 'signup'
      ? await client.auth.signUp({ email, password })
      : await client.auth.signInWithPassword({ email, password })
    setBusy(false)
    if (result.error) setNotice(result.error.message)
    else if (mode === 'signup' && !result.data.session) setNotice('Compte créé. Vérifiez votre adresse email pour l’activer.')
  }

  async function createStudio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client || !studioName.trim()) return
    setBusy(true); setNotice('')
    const { error } = await client.rpc('create_studio', { p_name: studioName.trim() })
    if (error) setNotice(error.message)
    else {
      setStudioName('')
      const { data } = await client.from('organizations').select('id,name,slug').order('created_at', { ascending: false })
      setStudios((data || []) as Studio[])
      setNotice('Votre studio est créé. Les modules métier arrivent dans les prochaines phases.')
    }
    setBusy(false)
  }

  if (!client) return <section className="platform-card" id="commencer"><div className="card-icon"><LockKeyhole size={24} /></div><p className="eyebrow">ESPACE STUDIO BIENTÔT DISPONIBLE</p><h2>Les comptes ne sont pas encore ouverts.</h2><p>Vous pouvez essayer la démo aujourd’hui. La création de vrais comptes sera disponible plus tard, quand le service sera prêt.</p><span className="status-chip">Projet séparé de GRS Vision</span></section>
  if (loading) return <section className="platform-card" id="commencer"><p>Vérification de votre session…</p></section>
  if (!session) return <section className="platform-card" id="commencer"><p className="eyebrow">VOTRE ESPACE</p><h2>{mode === 'signup' ? 'Créer votre compte.' : 'Bon retour.'}</h2><p>Un espace indépendant pour piloter votre activité visuelle.</p><form onSubmit={authenticate} className="account-form"><label>Adresse email<input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label><label>Mot de passe<input type="password" minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required value={password} onChange={event => setPassword(event.target.value)} /></label><button className="button button-dark" disabled={busy}>{busy ? 'Veuillez patienter…' : mode === 'signup' ? 'Créer mon compte' : 'Se connecter'}<ArrowRight size={18} /></button></form><button className="text-button" onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setNotice('') }}>{mode === 'signup' ? 'Déjà inscrit ? Se connecter' : 'Nouveau sur Obtura ? Créer un compte'}</button>{notice && <p className="notice" role="status">{notice}</p>}</section>
  return <section className="platform-card" id="commencer"><div className="account-top"><div><p className="eyebrow">ESPACE STUDIO</p><h2>Bonjour.</h2></div><button className="text-button" onClick={() => void client?.auth.signOut()}><LogOut size={16} /> Déconnexion</button></div><p>{session.user.email}</p><div className="studio-list">{studios.map(studio => <article key={studio.id}><span className="studio-avatar">{studio.name.slice(0, 1).toUpperCase()}</span><div><strong>{studio.name}</strong><small>/{studio.slug}</small></div><span className="status-chip">Actif</span></article>)}</div><form onSubmit={createStudio} className="account-form"><label>Nom du nouveau studio<input required minLength={2} maxLength={80} value={studioName} onChange={event => setStudioName(event.target.value)} placeholder="Ex. Studio Lumière" /></label><button className="button button-dark" disabled={busy}>{busy ? 'Création…' : 'Créer un studio'}<ArrowRight size={18} /></button></form>{notice && <p className="notice" role="status">{notice}</p>}</section>
}

export function App() {
  return <div className="page-shell"><header className="site-header"><Brand /><nav><a href="#fonctionnement">La plateforme</a><a href="#commencer">Espace studio</a></nav><a href="#commencer" className="header-cta">Commencer <ArrowRight size={16} /></a></header><main><section className="hero"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-content"><motion.p className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>LE STUDIO, ENFIN RÉUNI</motion.p><motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}>Votre vision.<br /><em>Votre élan.</em></motion.h1><motion.p className="hero-lead" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}>Obtura relie vos demandes, vos projets et vos livraisons dans un seul espace. Pensé pour les photographes, vidéastes et studios qui veulent créer sans perdre le fil.</motion.p><motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}><a className="button button-light" href="#commencer">Découvrir Obtura <ArrowRight size={18} /></a><span><Sparkles size={16} /> Book. Shoot. Deliver.</span></motion.div></div><div className="hero-art" aria-hidden="true"><div className="aperture-core"><Aperture size={155} strokeWidth={.65} /></div><span className="art-label top">IDEA → IMAGE</span><span className="art-label bottom">ONE CREATIVE FLOW</span></div></section><section className="intro-section" id="fonctionnement"><div className="section-heading"><p className="eyebrow">UN SEUL FLUX DE TRAVAIL</p><h2>De la première idée<br />à la dernière image.</h2></div><div className="feature-grid">{features.map((feature, index) => <motion.article key={feature.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .2 }} transition={{ delay: index * .08 }}><span className="feature-number">0{index + 1}</span><feature.icon size={30} strokeWidth={1.5} /><h3>{feature.title}</h3><p>{feature.detail}</p></motion.article>)}</div></section><section className="access-section"><div><p className="eyebrow">BÂTIR SON PROPRE STUDIO</p><h2>Votre activité mérite<br />un espace à sa mesure.</h2><p>Obtura évolue étape par étape. Les comptes et l’isolation des studios ouvrent la voie aux réservations, à la gestion de production et aux galeries privées.</p></div><Platform /></section></main><footer><Brand /><span>© {new Date().getFullYear()} Obtura. Une nouvelle plateforme, indépendante de GRS Vision.</span></footer></div>
}
