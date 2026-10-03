import { useState, type FormEvent } from 'react'
import { Aperture, ArrowLeft, ArrowRight, CalendarDays, Check, CircleDollarSign, Grid2X2, Images, LayoutDashboard, Layers3, Plus, Sparkles, Users, X } from 'lucide-react'

type Section = 'dashboard' | 'studio' | 'book' | 'galleries' | 'sites'
type Client = { id: number; name: string; email: string }
type Project = { id: number; title: string; client: string; status: string }
type Booking = { id: number; client: string; service: string; date: string }
type Gallery = { id: number; title: string; client: string; count: number }

const sections = [
  { key: 'dashboard' as Section, label: 'Vue d’ensemble', icon: LayoutDashboard },
  { key: 'studio' as Section, label: 'Studio', icon: Layers3 },
  { key: 'book' as Section, label: 'Réservations', icon: CalendarDays },
  { key: 'galleries' as Section, label: 'Galeries', icon: Images },
  { key: 'sites' as Section, label: 'Sites', icon: Grid2X2 },
]

const initialClients: Client[] = [
  { id: 1, name: 'Mariam Camara', email: 'mariam@example.com' },
  { id: 2, name: 'Maison Nimba', email: 'bonjour@nimba.example' },
  { id: 3, name: 'Aïcha Diallo', email: 'aicha@example.com' },
]
const initialProjects: Project[] = [
  { id: 1, title: 'Portraits de Mariam', client: 'Mariam Camara', status: 'En retouche' },
  { id: 2, title: 'Campagne Maison Nimba', client: 'Maison Nimba', status: 'Production' },
  { id: 3, title: 'Éditorial Aïcha', client: 'Aïcha Diallo', status: 'À livrer' },
]
const initialBookings: Booking[] = [
  { id: 1, client: 'Aïcha Diallo', service: 'Portraits de marque', date: '2026-10-13' },
  { id: 2, client: 'Maison Nimba', service: 'Shooting produit', date: '2026-10-16' },
]
const initialGalleries: Gallery[] = [
  { id: 1, title: 'La lumière de Mariam', client: 'Mariam Camara', count: 48 },
  { id: 2, title: 'Campagne Nimba', client: 'Maison Nimba', count: 32 },
]

function Brand() { return <span className="brand"><span className="brand-mark"><Aperture size={20} strokeWidth={1.7} /></span>obtura<span className="brand-dot">.</span></span> }

export function Demo() {
  const [section, setSection] = useState<Section>('dashboard')
  const [clients, setClients] = useState(initialClients)
  const [projects, setProjects] = useState(initialProjects)
  const [bookings, setBookings] = useState(initialBookings)
  const [galleries, setGalleries] = useState(initialGalleries)
  const [tasks, setTasks] = useState([false, false, false])
  const [modal, setModal] = useState<'client' | 'project' | 'booking' | 'gallery' | null>(null)
  const [form, setForm] = useState({ name: '', email: '', client: '', service: '', date: '', title: '' })
  const [siteTitle, setSiteTitle] = useState('Chaque image raconte.')
  const [siteIntro, setSiteIntro] = useState('Photographie de portraits et d’histoires singulières à Conakry.')
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [toast, setToast] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const id = Date.now()
    if (modal === 'client') {
      setClients(current => [...current, { id, name: form.name.trim(), email: form.email.trim() }])
      setToast('Client ajouté à la démo.')
    }
    if (modal === 'project') {
      setProjects(current => [...current, { id, title: form.title.trim(), client: form.client, status: 'Nouveau' }])
      setToast('Projet créé dans la démo.')
    }
    if (modal === 'booking') {
      setBookings(current => [...current, { id, client: form.client, service: form.service.trim(), date: form.date }])
      setToast('Réservation ajoutée à la démo.')
    }
    if (modal === 'gallery') {
      setGalleries(current => [...current, { id, title: form.title.trim(), client: form.client, count: 0 }])
      setToast('Galerie créée dans la démo.')
    }
    setForm({ name: '', email: '', client: '', service: '', date: '', title: '' })
    setModal(null)
    window.setTimeout(() => setToast(''), 4000)
  }

  const modalTitle = modal === 'client' ? 'Nouveau client' : modal === 'project' ? 'Nouveau projet' : modal === 'booking' ? 'Nouvelle réservation' : 'Nouvelle galerie'
  return <div className="demo-app"><aside className="demo-sidebar"><Brand /><div className="demo-studio-identity"><span>SH</span><div><b>Studio Horizon</b><small>Espace de démonstration</small></div></div><small className="demo-side-label">EXPLORER OBTURA</small><nav aria-label="Navigation de la démo">{sections.map(item => <button key={item.key} className={section === item.key ? 'active' : ''} onClick={() => { setSection(item.key); setSelectedGallery(null) }}><item.icon size={18} />{item.label}</button>)}</nav><div className="demo-sidebar-bottom"><span><Sparkles size={16} /> Mode démo</span><a href="#accueil"><ArrowLeft size={16} /> Retour au site</a></div></aside><div className="demo-main"><header className="demo-topbar"><div><small>OBTURA / {sections.find(item => item.key === section)?.label.toUpperCase()}</small><span>Données fictives · modifications temporaires</span></div><a href="#accueil">Quitter la démo <X size={17} /></a></header><div className="demo-body">
    {section === 'dashboard' && <><div className="demo-heading"><div><p>VENDREDI 02 OCTOBRE 2026</p><h1>Bonjour, Aïcha <span>✳</span></h1><small>Voici ce qui se passe dans votre studio aujourd’hui.</small></div><button onClick={() => { setSection('book'); setModal('booking') }}><Plus size={16} /> Nouvelle séance</button></div><div className="demo-kpi-grid"><article className="featured"><small>Projets actifs</small><strong>{projects.length.toString().padStart(2, '0')}</strong><span>Votre activité en mouvement <ArrowRight size={13} /></span></article><article><small>Séances à venir</small><strong>{bookings.length.toString().padStart(2, '0')}</strong><span>Planning du studio</span></article><article><small>Galeries</small><strong>{galleries.length.toString().padStart(2, '0')}</strong><span>Espaces de livraison</span></article><article><small>Clients</small><strong>{clients.length.toString().padStart(2, '0')}</strong><span>Relations suivies</span></article></div><div className="demo-dashboard-grid"><article className="demo-card"><div className="demo-card-head"><h2>Les priorités du jour</h2><span>{tasks.filter(Boolean).length} / 3 terminées</span></div>{['Préparer le shooting Maison Nimba','Envoyer la galerie de Mariam','Confirmer la prochaine séance'].map((task, index) => <label className="demo-task" key={task}><input type="checkbox" checked={tasks[index]} onChange={() => setTasks(current => current.map((value, taskIndex) => taskIndex === index ? !value : value))} /><span className={tasks[index] ? 'done' : ''}>{task}</span><small>{index === 0 ? '09:30' : index === 1 ? '14:00' : 'Demain'}</small></label>)}</article><article className="demo-card"><div className="demo-card-head"><h2>Le parcours créatif</h2><span>Ce mois-ci</span></div><div className="demo-flow"><span><CalendarDays size={17} /> Book <b>{bookings.length}</b></span><span><Layers3 size={17} /> Shoot <b>{projects.length}</b></span><span><Images size={17} /> Deliver <b>{galleries.length}</b></span></div></article></div><div className="demo-card"><div className="demo-card-head"><h2>Projets récents</h2><button onClick={() => setSection('studio')}>Voir le studio <ArrowRight size={15} /></button></div><div className="demo-table">{projects.slice(-4).reverse().map(project => <div key={project.id}><span className="demo-row-icon"><Layers3 size={16} /></span><strong>{project.title}</strong><span>{project.client}</span><span className="demo-status">{project.status}</span></div>)}</div></div></>}
    {section === 'studio' && <><div className="demo-heading"><div><p>VOTRE ESPACE DE TRAVAIL</p><h1>Le studio, réuni.</h1><small>Clients et projets avancent dans le même mouvement.</small></div><button onClick={() => setModal('project')}><Plus size={16} /> Nouveau projet</button></div><div className="demo-section-grid"><article className="demo-card"><div className="demo-card-head"><h2>Projets</h2><span>{projects.length} au total</span></div><div className="demo-table">{projects.map(project => <div key={project.id}><span className="demo-row-icon"><Layers3 size={16} /></span><strong>{project.title}</strong><span>{project.client}</span><span className="demo-status">{project.status}</span></div>)}</div></article><article className="demo-card"><div className="demo-card-head"><h2>Clients</h2><button onClick={() => setModal('client')}><Plus size={15} /> Ajouter</button></div>{clients.map(client => <div className="demo-client" key={client.id}><span>{client.name.slice(0,1)}</span><div><b>{client.name}</b><small>{client.email}</small></div></div>)}</article></div></>}
    {section === 'book' && <><div className="demo-heading"><div><p>BOOK / RÉSERVATIONS</p><h1>Chaque date compte.</h1><small>Organisez les séances à venir et créez-en de nouvelles.</small></div><button onClick={() => setModal('booking')}><Plus size={16} /> Nouvelle réservation</button></div><div className="demo-section-grid"><article className="demo-card"><div className="demo-card-head"><h2>Séances à venir</h2><span>{bookings.length} réservations</span></div>{bookings.slice().sort((a,b) => a.date.localeCompare(b.date)).map(booking => <div className="demo-booking" key={booking.id}><span className="demo-date"><b>{new Date(`${booking.date}T12:00:00`).getDate()}</b><small>{new Date(`${booking.date}T12:00:00`).toLocaleDateString('fr-FR',{month:'short'})}</small></span><div><b>{booking.service}</b><small>{booking.client}</small></div><span className="demo-status">Confirmée</span></div>)}</article><article className="demo-card demo-tip"><CalendarDays size={28} /><h2>Votre agenda, simplifié.</h2><p>Dans cette démo, ajoutez une réservation pour la voir apparaître ici et dans le tableau de bord. La disponibilité en ligne arrivera avec la plateforme connectée.</p></article></div></>}
    {section === 'galleries' && <><div className="demo-heading"><div><p>DELIVER / GALERIES</p><h1>Livrez avec émotion.</h1><small>Une présentation privée et soignée pour chaque projet.</small></div><button onClick={() => setModal('gallery')}><Plus size={16} /> Nouvelle galerie</button></div>{selectedGallery ? <div className="demo-gallery-detail"><button onClick={() => setSelectedGallery(null)}><ArrowLeft size={16} /> Toutes les galeries</button><div className="demo-gallery-cover"><small>GALERIE PRIVÉE · APERÇU</small><h2>{selectedGallery.title}</h2><span>{selectedGallery.client} · {selectedGallery.count} images de démonstration</span></div><p>Les images ci-dessus sont représentées par un visuel d’ambiance. Le téléversement et le partage privé seront disponibles après connexion du service de données.</p></div> : <div className="demo-gallery-grid">{galleries.map((gallery,index) => <button className={`demo-gallery-card shade-${index%3}`} key={gallery.id} onClick={() => setSelectedGallery(gallery)}><small>GALERIE 0{index+1}</small><strong>{gallery.title}</strong><span>{gallery.client} · {gallery.count} images</span><ArrowRight size={18} /></button>)}</div>}</>}
    {section === 'sites' && <><div className="demo-heading"><div><p>SITES / PORTFOLIO</p><h1>Votre univers en ligne.</h1><small>Personnalisez le texte de la prévisualisation en direct.</small></div></div><div className="demo-site-grid"><article className="demo-card"><div className="demo-card-head"><h2>Votre signature</h2><span>Aperçu local</span></div><label className="demo-field">Titre principal<input value={siteTitle} maxLength={70} onChange={event => setSiteTitle(event.target.value)} /></label><label className="demo-field">Présentation<textarea value={siteIntro} maxLength={180} onChange={event => setSiteIntro(event.target.value)} /></label><p>Les modifications restent dans cet onglet et ne publient pas de véritable site.</p></article><div className="demo-site-preview"><div className="demo-site-preview-nav"><span>studio horizon<span>.</span></span><span>PORTFOLIO &nbsp; À PROPOS &nbsp; CONTACT</span></div><div><small>PHOTOGRAPHIE · CONAKRY</small><h2>{siteTitle || 'Votre titre ici'}</h2><p>{siteIntro || 'Votre présentation ici.'}</p><span>Découvrir mon travail <ArrowRight size={16} /></span></div></div></div></>}
  </div></div>{toast && <div className="demo-toast" role="status"><Check size={15} />{toast}</div>}{modal && <div className="demo-modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}><form className="demo-modal" onSubmit={submit}><div className="demo-card-head"><h2>{modalTitle}</h2><button type="button" onClick={() => setModal(null)} aria-label="Fermer"><X size={18} /></button></div><p>Cette action modifie seulement les données temporaires de la démo.</p>{modal === 'client' ? <><label className="demo-field">Nom<input required value={form.name} onChange={event => setForm({...form,name:event.target.value})} placeholder="Ex. Fatou Diallo" /></label><label className="demo-field">Adresse email<input required type="email" value={form.email} onChange={event => setForm({...form,email:event.target.value})} placeholder="fatou@example.com" /></label></> : <>{modal !== 'booking' && <label className="demo-field">{modal === 'project' ? 'Nom du projet' : 'Titre de la galerie'}<input required value={form.title} onChange={event => setForm({...form,title:event.target.value})} placeholder={modal === 'project' ? 'Ex. Portraits de Fatou' : 'Ex. Une journée inoubliable'} /></label>}<label className="demo-field">Client<select required value={form.client} onChange={event => setForm({...form,client:event.target.value})}><option value="">Choisir un client</option>{clients.map(client => <option key={client.id} value={client.name}>{client.name}</option>)}</select></label>{modal === 'booking' && <><label className="demo-field">Prestation<input required value={form.service} onChange={event => setForm({...form,service:event.target.value})} placeholder="Ex. Portraits de marque" /></label><label className="demo-field">Date<input required type="date" value={form.date} onChange={event => setForm({...form,date:event.target.value})} /></label></>}</>}<button className="demo-submit" type="submit"><Plus size={16} /> Ajouter à la démo</button></form></div>}</div>
}
