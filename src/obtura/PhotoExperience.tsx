import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Images, Link2, Send, Smartphone, Sparkles } from 'lucide-react'

const photo = (name: string) => `${import.meta.env.BASE_URL}${name}`

const collections = [
  { id: 'portraits', label: 'Portraits', number: '01', title: 'Des portraits pour se montrer.', copy: 'Découvrez des portraits de personnes, en studio ou ailleurs.', images: ['DSC02997.JPG', 'DSC02957.JPG', 'DSC09249.jpg', 'DSC09897-Modifier.jpg', 'DSC01221.JPG'] },
  { id: 'editorial', label: 'Mode & éditorial', number: '02', title: 'Des photos pour la mode.', copy: 'Découvrez des images de vêtements, de looks et de campagnes.', images: ['DSC09219-Modifier.jpg', 'DSC03735.JPG', 'DSC09246.jpg', 'DSC09896.jpg', 'DSC09265.jpg'] },
  { id: 'reportage', label: 'Reportage', number: '03', title: 'Des moments à garder.', copy: 'Découvrez des photos prises pendant la vie de tous les jours et les événements.', images: ['DSC00855-Modifier.JPG', 'DSC00877.JPG', 'DSC06402.JPG', 'DSC01002.JPG', 'DSC01206.JPG'] },
  { id: 'espaces', label: 'Lieux & design', number: '04', title: 'Des lieux en images.', copy: 'Découvrez des photos de bâtiments, de pièces et de leurs détails.', images: ['DSC09279.jpg', 'DSC09330.jpg', 'DSC09283.jpg', 'DSC09314.jpg', 'DSC09316.jpg', 'DSC09393.jpg', 'DSC09420.jpg'] },
] as const

export function PhotoHero() {
  const reducedMotion = useReducedMotion()
  const { scrollY } = useScroll()
  const nearY = useTransform(scrollY, [0, 850], [0, reducedMotion ? 0 : -105])
  const farY = useTransform(scrollY, [0, 850], [0, reducedMotion ? 0 : 65])
  return <div className="photo-hero-art" aria-hidden="true">
    <motion.div className="photo-hero-frame photo-hero-frame-back" style={{ y: farY }}><img src={photo('DSC09219-Modifier.jpg')} alt="" fetchPriority="high" /></motion.div>
    <motion.div className="photo-hero-frame photo-hero-frame-main" style={{ y: nearY }}><img src={photo('DSC09897-Modifier.jpg')} alt="" fetchPriority="high" /></motion.div>
    <motion.div className="photo-hero-frame photo-hero-frame-small" style={{ y: farY }}><img src={photo('DSC00855-Modifier.JPG')} alt="" loading="lazy" /></motion.div>
    <div className="photo-hero-orbit">IMAGINE · CREATE · DELIVER ·</div>
  </div>
}

export function ActivityGallery() {
  const [collectionIndex, setCollectionIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()
  const current = collections[collectionIndex]
  useEffect(() => {
    if (paused || reducedMotion) return
    const timer = window.setInterval(() => setImageIndex(index => (index + 1) % current.images.length), 4800)
    return () => window.clearInterval(timer)
  }, [paused, reducedMotion, current])
  const choose = (index: number) => { setCollectionIndex(index); setImageIndex(0) }
  const move = (step: number) => setImageIndex(index => (index + step + current.images.length) % current.images.length)
  const next = current.images[(imageIndex + 1) % current.images.length]
  const previous = current.images[(imageIndex - 1 + current.images.length) % current.images.length]
  return <section className="activity-section" id="univers">
    <div className="activity-head"><div><p className="eyebrow">DES EXEMPLES DE PHOTOS</p><h2>Des photos pour<br /><em>chaque projet.</em></h2></div><p>Portraits, mode, reportages ou lieux : choisissez un thème et faites défiler les photos.</p></div>
    <div className="activity-tabs" role="group" aria-label="Choisir un univers photographique">{collections.map((item, index) => <button key={item.id} type="button" aria-pressed={index === collectionIndex} className={index === collectionIndex ? 'active' : ''} onClick={() => choose(index)}><span>{item.number}</span>{item.label}<ArrowUpRight size={15} /></button>)}</div>
    <div className="activity-stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false) }}>
      <div className="activity-image-wrap"><AnimatePresence mode="wait"><motion.img key={`${current.id}-${imageIndex}`} src={photo(current.images[imageIndex])} alt={`${current.label} — photographie ${imageIndex + 1} sur ${current.images.length}`} initial={reducedMotion ? false : { opacity: 0, scale: 1.085 }} animate={{ opacity: 1, scale: 1 }} exit={reducedMotion ? undefined : { opacity: 0, scale: .985 }} transition={{ duration: .85, ease: [0.22, 1, 0.36, 1] }} /></AnimatePresence><span className="activity-watermark">obtura<span>.</span></span></div>
      <div className="activity-side"><div className="activity-side-number">{current.number}<span> / 04</span></div><div><p>UNIVERS / {current.label.toUpperCase()}</p><h3>{current.title}</h3><span>{current.copy}</span></div><div className="activity-controls"><span>{String(imageIndex + 1).padStart(2, '0')} — {String(current.images.length).padStart(2, '0')}</span><button type="button" onClick={() => move(-1)} aria-label="Image précédente"><ChevronLeft size={20} /></button><button type="button" onClick={() => move(1)} aria-label="Image suivante"><ChevronRight size={20} /></button></div></div>
    </div>
    <div className="activity-filmstrip" aria-hidden="true"><img src={photo(previous)} alt="" loading="lazy" /><img src={photo(current.images[imageIndex])} alt="" loading="lazy" /><img src={photo(next)} alt="" loading="lazy" /></div>
  </section>
}

export function GalleryDelivery() {
  const [sent, setSent] = useState(false)
  const [opened, setOpened] = useState(false)
  const reducedMotion = useReducedMotion()
  return <section className="delivery-section" id="livraison"><div className="delivery-copy"><p className="eyebrow">ENVOYER LES PHOTOS</p><h2>Vos photos.<br />Un lien.<br /><em>C’est envoyé.</em></h2><p>Après la séance, rassemblez les photos dans une galerie privée. Votre client reçoit un lien pour les regarder sur son téléphone.</p><div className="delivery-steps"><span><Images size={18} /> Créez la galerie</span><span><Link2 size={18} /> Préparez le lien</span><span><Smartphone size={18} /> Le client ouvre la galerie</span></div><button className="delivery-send" type="button" onClick={() => { setSent(true); setOpened(false) }}><Send size={17} /> {sent ? 'Renvoyer la simulation' : 'Voir la simulation'} <ArrowRight size={18} /></button><small>Ceci est une démo : aucun message n’est envoyé.</small></div>
    <div className="delivery-visual"><div className="delivery-depth depth-one" /><div className="delivery-depth depth-two" /><motion.div className="delivery-gallery-card" initial={reducedMotion ? false : { opacity: 0, x: -60, rotate: -9 }} whileInView={{ opacity: 1, x: 0, rotate: -7 }} viewport={{ once: true }} transition={{ duration: .8 }}><img src={photo('DSC09897-Modifier.jpg')} alt="Aperçu d’une galerie photographique" loading="lazy" /><div><span>GALERIE PRIVÉE · STUDIO HORIZON</span><strong>Éclats de lumière</strong><small>Une histoire en images · 24 photographies</small></div></motion.div><div className="delivery-link"><Link2 size={16} /><span>obtura / galerie / eclats-de-lumiere</span><Check size={15} /></div><div className="phone-mock" aria-label="Simulation de réception d’une galerie sur téléphone"><div className="phone-camera" /><div className="phone-status">9:41 <span>●●● ▰</span></div><AnimatePresence mode="wait">{!sent ? <motion.div key="waiting" className="phone-waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Sparkles size={30} /><span>Votre prochaine belle histoire<br />arrive ici.</span></motion.div> : !opened ? <motion.div key="notification" className="phone-message" initial={reducedMotion ? false : { opacity: 0, y: -35, scale: .92 }} animate={{ opacity: 1, y: 0, scale: 1 }}><small>MESSAGES · MAINTENANT</small><strong>Studio Horizon</strong><p>Votre galerie « Éclats de lumière » est prête. Découvrez vos images ✳</p><button type="button" onClick={() => setOpened(true)}>Ouvrir la galerie <ArrowRight size={14} /></button></motion.div> : <motion.div key="gallery" className="phone-gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><img src={photo('DSC09897-Modifier.jpg')} alt="Portrait dans la galerie de démonstration" loading="lazy" /><div><small>STUDIO HORIZON</small><strong>Éclats de lumière</strong><span>24 photos à découvrir</span></div><div className="phone-photo-grid"><img src={photo('DSC09896.jpg')} alt="" loading="lazy" /><img src={photo('DSC09400.jpg')} alt="" loading="lazy" /></div><button type="button" onClick={() => setOpened(false)}>← Revenir au message</button></motion.div>}</AnimatePresence><div className="phone-home" /></div></div>
  </section>
}
