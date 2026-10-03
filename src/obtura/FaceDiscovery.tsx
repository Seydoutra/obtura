import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Check, Images, ScanFace, ShieldCheck, Sparkles } from 'lucide-react'
import { GalleryDelivery } from './PhotoExperience'

const image = (file: string) => `${import.meta.env.BASE_URL}${file}`
const samplePhotos = [
  { file: 'DSC02997.JPG', label: 'Autre portrait de la galerie' },
  { file: 'DSC09249.jpg', label: 'Portrait en intérieur' },
  { file: 'DSC09246.jpg', label: 'Portrait dans le salon' },
  { file: 'DSC09219-Modifier.jpg', label: 'Scène éditoriale' },
]

export function GalleryDeliveryWithFaces() {
  const [consent, setConsent] = useState(false)
  const [prioritized, setPrioritized] = useState(false)
  const reducedMotion = useReducedMotion()

  return <>
    <GalleryDelivery />
    <section className="face-section" id="photos-pour-vous" aria-labelledby="face-title">
      <div className="face-section-copy">
        <p className="eyebrow"><ScanFace size={16} /> UNE GALERIE QUI VOUS RETROUVE</p>
        <h2 id="face-title">Vos photos.<br /><em>Dès le premier regard.</em></h2>
        <p>Après réception du lien, le client pourra choisir de retrouver en priorité les photos où il apparaît. Toute la galerie reste accessible, sans imposer ce tri aux autres invités.</p>
        <div className="face-feature-list">
          <span><Check size={17} /> Activable par le studio, galerie par galerie</span>
          <span><Check size={17} /> Recherche lancée uniquement avec l’accord du client</span>
          <span><Check size={17} /> Résultats prioritaires, jamais exclusifs</span>
        </div>
        <p className="face-disclaimer"><ShieldCheck size={17} /> Aperçu interactif : cette version ne collecte aucun visage et ne réalise pas encore de reconnaissance faciale.</p>
      </div>
      <div className="face-experience" aria-label="Démonstration du parcours client">
        <div className="face-experience-top"><span><Sparkles size={15} /> obtura<span className="face-dot">.</span> / galerie privée</span><span>01 — 04</span></div>
        <div className="face-experience-intro"><small>LIEN REÇU · ÉCLATS DE LUMIÈRE</small><h3>La galerie s’ouvre.<br />Votre histoire aussi.</h3><p>Découvrir toutes les images ou choisir une vue qui commence par vous.</p></div>
        <div className="face-consent-card"><div className="face-consent-icon"><ScanFace size={27} /></div><div><strong>Retrouver mes photos</strong><p>Dans cette démo, le résultat est simulé avec des images d’exemple.</p></div><label className="face-checkbox"><input type="checkbox" checked={consent} onChange={event => { setConsent(event.target.checked); setPrioritized(false) }} /><span>J’accepte de tester cette simulation</span></label><button type="button" disabled={!consent} onClick={() => setPrioritized(true)}>{prioritized ? 'Vue personnalisée affichée' : 'Voir les photos en priorité'} <ArrowRight size={17} /></button></div>
        <div className="face-results-heading"><div><small>{prioritized ? 'APERÇU PERSONNALISÉ · SIMULATION' : 'TOUTE LA GALERIE · APERÇU'}</small><strong>{prioritized ? 'Celles où vous apparaissez d’abord' : 'Toutes les histoires réunies'}</strong></div><span>{prioritized ? '03 / 04 en premier' : '04 images'}</span></div>
        <div className="face-results" aria-live="polite"><AnimatePresence mode="popLayout">{(prioritized ? [samplePhotos[1], samplePhotos[2], samplePhotos[3], samplePhotos[0]] : samplePhotos).map((item, index) => <motion.figure key={item.file} layout initial={reducedMotion ? false : { opacity: 0, scale: .94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45 }}><img src={image(item.file)} alt={item.label} loading="lazy" /><figcaption>{prioritized && index < 3 ? 'EN PRIORITÉ · ' : ''}{item.label}</figcaption></motion.figure>)}</AnimatePresence></div>
        {prioritized && <button className="face-reset" type="button" onClick={() => setPrioritized(false)}>Revoir l’ordre de toute la galerie</button>}
      </div>
    </section>
  </>
}

export function FacePriorityDemo({ section }: { section: 'dashboard' | 'studio' | 'book' | 'galleries' | 'sites' }) {
  const [studioEnabled, setStudioEnabled] = useState(false)
  const [clientConsent, setClientConsent] = useState(false)
  const [clientView, setClientView] = useState(false)
  if (section !== 'dashboard' && section !== 'galleries') return null

  return <section className={`demo-face ${section === 'dashboard' ? 'demo-face-compact' : ''}`} aria-label="Recherche de photos par visage — aperçu">
    <div className="demo-face-heading"><div className="demo-face-icon"><ScanFace size={24} /></div><div><small>NOUVEAU · EXPÉRIENCE GALERIE</small><h2>Les photos du client, en premier.</h2><p>Une recherche par visage, proposée uniquement si le studio l’active et si le client y consent.</p></div><span className={`demo-face-status ${studioEnabled ? 'on' : ''}`}>{studioEnabled ? 'Activé dans la démo' : 'Désactivé par défaut'}</span></div>
    <div className="demo-face-body"><div className="demo-face-flow"><div><span>01</span><strong>Le studio propose</strong><small>Option par galerie</small></div><ArrowRight size={17} /><div><span>02</span><strong>Le client accepte</strong><small>Choix explicite</small></div><ArrowRight size={17} /><div><span>03</span><strong>Ses images d’abord</strong><small>Galerie complète conservée</small></div></div><button type="button" className="demo-face-toggle" aria-pressed={studioEnabled} onClick={() => { setStudioEnabled(value => !value); setClientConsent(false); setClientView(false) }}>{studioEnabled ? 'Désactiver l’option' : 'Activer dans la démo'}</button></div>
    {section === 'galleries' && <div className="demo-face-client"><div><small>PARCOURS CLIENT · SIMULATION</small><h3>Un lien, puis le choix de se retrouver.</h3><p>Le client garde accès à toutes les photos, même après le tri prioritaire.</p><label><input type="checkbox" disabled={!studioEnabled} checked={clientConsent} onChange={event => { setClientConsent(event.target.checked); setClientView(false) }} /> J’accepte de tester la recherche de mes photos</label><button type="button" disabled={!clientConsent} onClick={() => setClientView(true)}><Images size={16} /> {clientView ? 'Vue prioritaire affichée' : 'Afficher ma sélection'}</button></div><div className="demo-face-photos">{(clientView ? [samplePhotos[1], samplePhotos[2], samplePhotos[3]] : samplePhotos.slice(0, 3)).map((item, index) => <div key={item.file}><img src={image(item.file)} alt={item.label} loading="lazy" /><small>{clientView ? `Priorité ${index + 1}` : 'Galerie complète'}</small></div>)}</div></div>}
    <p className="demo-face-note"><ShieldCheck size={15} /> Simulation de produit, sans analyse biométrique ni stockage de visage. La vraie fonction exigera une galerie privée, un traitement sécurisé, un consentement révocable et des tests de fiabilité.</p>
  </section>
}
