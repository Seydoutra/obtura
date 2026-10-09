import { Aperture, ArrowRight, LockKeyhole } from 'lucide-react'

export function Platform() {
  return <section className="platform-card" id="commencer"><div className="card-icon"><Aperture size={24} /></div><p className="eyebrow">VOTRE ESPACE OBTURA</p><h2>Un espace pour votre activité.</h2><p>Les pages de connexion et d’inscription sont prêtes. Les vrais comptes seront activés avec la future base de données Obtura, indépendante de GRS Vision.</p><div className="platform-actions"><a className="button button-dark" href="#/signup">Voir l’inscription <ArrowRight size={18} /></a><a className="text-button" href="#/login">Voir la connexion</a></div><span className="status-chip"><LockKeyhole size={12} /> Comptes en attente · démo disponible</span></section>
}
