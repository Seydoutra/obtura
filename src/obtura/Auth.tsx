import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { Aperture, ArrowLeft, ArrowRight, Eye, EyeOff, KeyRound, LockKeyhole, LogOut, Mail, Plus, ShieldCheck } from 'lucide-react'
import { client } from './client'

type Mode = 'login' | 'signup' | 'forgot-password' | 'reset-password'
type Studio = { id: string; name: string; slug: string }
const redirectUrl = `${window.location.origin}${window.location.pathname}`

function Brand() {
  return <span className="brand"><span className="brand-mark"><Aperture size={21} strokeWidth={1.65} /></span>obtura<span className="brand-dot">.</span></span>
}

function Shell({ children }: { children: ReactNode }) {
  return <div className="auth-page"><aside className="auth-aside"><a href="#" aria-label="Obtura, accueil"><Brand /></a><div className="auth-aside-copy"><span>VOTRE UNIVERS CRÉATIF, AU MÊME ENDROIT</span><h1>Créez plus.<br /><em>Cherchez moins.</em></h1><p>Vos rendez-vous, vos clients et vos galeries réunis dans un espace pensé pour les créatifs.</p></div><small>OBTURA · BOOK. SHOOT. DELIVER.</small></aside><main className="auth-main"><div className="auth-mobile-brand"><a href="#"><Brand /></a></div><div className="auth-panel">{children}</div><p className="auth-legal">Votre compte Obtura sera séparé de GRS Vision.</p></main></div>
}

function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(Boolean(client))
  useEffect(() => {
    if (!client) return
    let active = true
    void client.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false) } })
    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (!active) return
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') window.location.hash = '#/reset-password'
    })
    return () => { active = false; data.subscription.unsubscribe() }
  }, [])
  return { session, loading }
}

export function AuthPage({ mode }: { mode: Mode }) {
  const { session } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(() => { setNotice(''); setPassword(''); setConfirmation('') }, [mode])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client || busy) return
    if (mode === 'signup' || mode === 'reset-password') {
      if (password.length < 12) { setNotice('Choisissez un mot de passe d’au moins 12 caractères.'); return }
      if (password !== confirmation) { setNotice('Les mots de passe ne correspondent pas.'); return }
    }
    setBusy(true); setNotice('')
    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectUrl } })
        if (error) throw error
        if (data.session) window.location.hash = '#/studio'
        else setNotice('Si cette adresse est admissible, un email de confirmation vous sera envoyé.')
      } else if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        window.location.hash = '#/studio'
      } else if (mode === 'forgot-password') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo: redirectUrl })
        if (error) throw error
        setNotice('Si un compte existe pour cette adresse, vous recevrez un lien pour changer votre mot de passe.')
      } else {
        const { error } = await client.auth.updateUser({ password })
        if (error) throw error
        setPassword(''); setConfirmation('')
        setNotice('Mot de passe mis à jour. Vous pouvez accéder à votre studio.')
      }
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Une erreur est survenue. Réessayez.') }
    finally { setBusy(false) }
  }

  const copy = {
    login: ['BON RETOUR', 'Ravi de vous revoir.', 'Connectez-vous pour retrouver votre espace créatif.', 'Se connecter'],
    signup: ['REJOINDRE OBTURA', 'Créez votre compte.', 'Commencez avec votre email, puis créez votre studio privé.', 'Créer mon compte'],
    'forgot-password': ['ACCÈS À VOTRE COMPTE', 'Mot de passe oublié ?', 'Indiquez votre email. Nous vous enverrons un lien de réinitialisation.', 'Envoyer le lien'],
    'reset-password': ['NOUVEAU DÉPART', 'Choisissez un mot de passe.', 'Utilisez au moins 12 caractères pour protéger votre espace.', 'Enregistrer le mot de passe'],
  }[mode]
  const disabled = !client || busy || (mode === 'reset-password' && !session)

  return <Shell><a className="auth-back" href="#"><ArrowLeft size={16} /> Retour au site</a><div className="auth-heading"><span className="auth-icon">{mode.includes('password') ? <KeyRound size={22} /> : <Aperture size={23} />}</span><p className="eyebrow">{copy[0]}</p><h2>{copy[1]}</h2><p>{copy[2]}</p></div>{!client && <div className="auth-unavailable" role="status"><LockKeyhole size={19} /> Les vrais comptes sont en attente de la base de données Obtura. Explorez la démo sans créer de compte.</div>}{mode === 'reset-password' && !session && client && <div className="auth-unavailable" role="status"><LockKeyhole size={19} /> Ouvrez le lien reçu par email avant de choisir un nouveau mot de passe.</div>}<form className="auth-form" onSubmit={submit}>{mode !== 'reset-password' && <label>Adresse email<div className="auth-input"><Mail size={18} /><input type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="vous@exemple.com" disabled={!client || busy} /></div></label>}{mode !== 'forgot-password' && <label>{mode === 'reset-password' ? 'Nouveau mot de passe' : 'Mot de passe'}<div className="auth-input"><KeyRound size={18} /><input type={showPassword ? 'text' : 'password'} minLength={mode === 'login' ? 1 : 12} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required value={password} onChange={event => setPassword(event.target.value)} placeholder={mode === 'login' ? 'Votre mot de passe' : '12 caractères minimum'} disabled={disabled} /><button type="button" aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>}{(mode === 'signup' || mode === 'reset-password') && <label>Confirmer le mot de passe<div className="auth-input"><ShieldCheck size={18} /><input type={showPassword ? 'text' : 'password'} minLength={12} autoComplete="new-password" required value={confirmation} onChange={event => setConfirmation(event.target.value)} placeholder="Répétez le mot de passe" disabled={disabled} /></div></label>}{mode === 'login' && <a className="auth-forgot" href="#/forgot-password">Mot de passe oublié ?</a>}<button className="auth-submit" type="submit" disabled={disabled}>{busy ? 'Veuillez patienter…' : copy[3]} <ArrowRight size={18} /></button></form>{notice && <p className="auth-notice" role="status">{notice}</p>}<div className="auth-switch">{mode === 'login' ? <>Pas encore de compte ? <a href="#/signup">S’inscrire</a></> : mode === 'signup' ? <>Déjà un compte ? <a href="#/login">Se connecter</a></> : mode === 'reset-password' && session ? <a href="#/studio">Accéder à mon studio</a> : <a href="#/login">Retour à la connexion</a>}</div>{!client && <a className="auth-demo-link" href="#/demo">Explorer la démo <ArrowRight size={16} /></a>}</Shell>
}

export function StudioPage() {
  const { session, loading } = useSession()
  const [studios, setStudios] = useState<Studio[]>([])
  const [studioName, setStudioName] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!client || !session) { setStudios([]); return }
    let active = true
    void client.from('organizations').select('id,name,slug').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (!active) return
      if (error) setNotice('Impossible de charger vos studios. Vérifiez la configuration de la base Obtura.')
      else setStudios((data || []) as Studio[])
    })
    return () => { active = false }
  }, [session?.user.id])
  async function createStudio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!client || !studioName.trim() || busy) return
    setBusy(true); setNotice('')
    const { error } = await client.rpc('create_studio', { p_name: studioName.trim() })
    if (error) setNotice(error.message)
    else {
      setStudioName('')
      const { data, error: listError } = await client.from('organizations').select('id,name,slug').order('created_at', { ascending: false })
      if (listError) setNotice('Studio créé, mais la liste n’a pas pu être actualisée.')
      else { setStudios((data || []) as Studio[]); setNotice('Votre studio est prêt. Les autres modules arrivent ensuite.') }
    }
    setBusy(false)
  }
  if (!client) return <Shell><div className="auth-heading"><span className="auth-icon"><LockKeyhole size={22} /></span><p className="eyebrow">ESPACE STUDIO</p><h2>Ouverture prochaine.</h2><p>La base de données Obtura n’est pas encore créée. Aucun compte réel n’est accessible.</p></div><a className="auth-submit" href="#/demo">Explorer la démo <ArrowRight size={18} /></a></Shell>
  if (loading) return <Shell><p role="status">Vérification de votre session…</p></Shell>
  if (!session) return <Shell><div className="auth-heading"><p className="eyebrow">ESPACE PRIVÉ</p><h2>Connectez-vous d’abord.</h2><p>Seuls les membres d’un studio peuvent accéder à ses données.</p></div><a className="auth-submit" href="#/login">Se connecter <ArrowRight size={18} /></a></Shell>
  return <div className="studio-page"><header><a href="#"><Brand /></a><button type="button" onClick={() => void client?.auth.signOut().then(() => { window.location.hash = '#/login' })}><LogOut size={17} /> Déconnexion</button></header><main><p className="eyebrow">ESPACE STUDIO</p><h1>Bonjour<span className="brand-dot">.</span></h1><p className="studio-email">{session.user.email}</p><div className="studio-overview"><div><span>{studios.length.toString().padStart(2, '0')}</span><p>{studios.length > 1 ? 'studios' : 'studio'} dans votre espace</p></div><ShieldCheck size={35} strokeWidth={1.35} /></div><h2>Vos studios</h2><div className="studio-list">{studios.map(studio => <article key={studio.id}><span className="studio-avatar">{studio.name.slice(0, 1).toUpperCase()}</span><div><strong>{studio.name}</strong><small>/{studio.slug}</small></div><span className="status-chip">Actif</span></article>)}</div><form className="studio-create" onSubmit={createStudio}><h3><Plus size={20} /> Créer un studio</h3><p>Chaque studio possède son propre espace de données.</p><label>Nom du studio<input value={studioName} onChange={event => setStudioName(event.target.value)} minLength={2} maxLength={80} required placeholder="Ex. Studio Lumière" /></label><button className="auth-submit" disabled={busy}>{busy ? 'Création…' : 'Créer mon studio'} <ArrowRight size={18} /></button></form>{notice && <p className="auth-notice" role="status">{notice}</p>}</main></div>
}
