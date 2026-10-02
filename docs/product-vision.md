# Vision produit — Obtura 2.0

## Positionnement

**Obtura est le système d'exploitation de l'activité des créateurs visuels.** Il relie la première demande à la réservation, la production, la livraison et au dernier paiement. Promesse : **Book. Shoot. Deliver. Get paid. Grow.**

Obtura reprend trois univers éprouvés dans la base GRS : **Sites** (vitrine), **Galleries** (livraison) et **Studio** (pilotage). Le produit est multi-studios dès sa fondation. Un professionnel indépendant peut commencer seul ; une équipe peut grandir sans changer d'outil.

## Cibles et besoins

Photographes, vidéastes, créateurs de contenu, studios, agences de production et équipes événementielles. Le point commun est un travail par clients, prestations, dates, fichiers et paiements. Les réalités prioritaires sont le téléphone, WhatsApp, les connexions moyennes, les devises locales et Mobile Money.

## Parcours économique central

`Demande → Lead → Qualification → Proposition/Devis → Réservation → Acompte → Projet/Production → Galerie/Validation → Solde → Relance/Fidélisation`

Chaque transition doit laisser une trace et éviter les doubles saisies. Une réservation confirmée doit créer ou rattacher le client et le projet ; un paiement doit mettre à jour la facture ; une galerie doit être liée au bon projet et au bon tenant.

## Modules

- **Studio / CRM** : prospects, clients, pipeline, tâches, projets et vue du jour.
- **Book** : services, packages, disponibilités, créneaux, booking partageable et mini-sessions.
- **Pay + Contracts** : devis, contrats, acomptes, factures, paiements partiels, reçus et relances.
- **Production** : planning, équipe, tâches, documents et matériel.
- **Galleries** : accès privé, preuve, commentaires, sélection, approbation, livraison et statistiques d'ouverture.
- **Sites** : vitrine à identité personnalisée, portfolio, services, formulaires, domaines et SEO.
- **Store + Flow** : ventes additionnelles et automatisations après stabilisation du parcours central.
- **Insights** : chiffres fondés sur les transactions réelles, filtrables par période et service.
- **AI + Event** : fonctionnalités sous flags jusqu'à ce que les données, consentements et processus soient fiables. Pas de recherche faciale active au lancement.

## Principes de conception

1. **Un seul produit** : navigation et objets métier cohérents entre Sites, Galleries et Studio.
2. **Le téléphone en premier** : les actions fréquentes tiennent sur petit écran ; les pages chargent sur connexion moyenne.
3. **WhatsApp pratique** : lien ou message prérempli d'abord, fournisseur officiel ensuite. Aucun bouton ne doit laisser croire qu'un envoi automatisé a eu lieu s'il ouvre seulement WhatsApp.
4. **Paiements locaux** : architecture par fournisseur et pays ; GNF/XOF/XAF/USD/EUR ; montants et devise explicites sur chaque document.
5. **Confidentialité réelle** : séparation stricte des studios et des fichiers clients, vérifiée par tests.
6. **Valeur en moins de 10 minutes** : création du compte, du studio, du premier service et de la page de réservation guidées par une checklist.
7. **Clarté opérationnelle** : le tableau de bord répond à « que faire aujourd'hui ? », le CRM à « qui convertir ? », les finances à « qui doit payer ? ».

## Offres

Trois offres seulement : **Free**, **Pro** (recommandée) et **Entreprise**. Les prix restent configurables et non fixés dans le code. Les droits et quotas sont appliqués côté serveur ; l'interface explique les limites sans masquer les données existantes lorsqu'un abonnement change. Free couvre réellement clients, leads, projets, galerie et facturation manuelle. Pro débloque équipe, mini-sessions, contrats, galeries avancées, automatisations et intégrations. Entreprise ajoute gouvernance, volumes, white label, API et support contractuel.

## Première version commercialisable

Le cœur à livrer en priorité : inscription et studio isolé, premier service, lead, réservation, devis, acompte enregistré, projet, galerie privée et facture de solde. Le paiement en ligne ne sera annoncé comme disponible que lorsqu'un fournisseur aura été intégré et testé dans le pays concerné. Les modules avancés restent derrière des flags.

## Mesures de réussite

- Un créateur termine l'onboarding et publie un premier lien de réservation en moins de 10 minutes, sans assistance.
- Le parcours lead → réservation → projet → galerie → solde fonctionne sans ressaisie du client.
- Aucun utilisateur d'un studio ne peut lire, modifier ou deviner un média ou une ligne métier d'un autre studio.
- Sur mobile et connexion moyenne, les listes sont paginées et les galeries chargent d'abord des aperçus légers.
- Les métriques financières affichées se réconcilient avec les paiements et factures enregistrés.

## Ordre de livraison

Fondation multi-tenant et sécurité, puis CRM/Book, finance et contrats, production, galeries, ensuite Store/Flow/WhatsApp, Insights, AI et Event. Les phases et leurs critères de sortie sont détaillés dans `architecture-v2-proposal.md`. Aucune publication ni migration de GRS ne doit précéder la validation du plan.
