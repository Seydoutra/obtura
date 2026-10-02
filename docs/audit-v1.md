# Audit de la base GRS Vision pour Obtura 2.0

Date : 2 octobre 2026. Périmètre : copie locale `obtura-saas/` issue de `grs-vision/`. Cet audit porte sur le code et les migrations fournies, pas sur un inventaire direct de la base Supabase de production.

## 1. État du duplicata

- La copie est indépendante dans le système de fichiers. Le dossier source `grs-vision/` n'a pas été modifié pour ce chantier.
- Les sources, migrations et 43 fichiers du dossier `public/` ont été copiés. Les dépendances installées, builds, caches, état de l'hébergement Sites et éventuels secrets locaux ont été exclus. Les 27 photos du portfolio GRS font partie de cette copie de travail et ne doivent pas devenir des exemples publics d'Obtura sans décision explicite sur les droits et la présentation.
- Aucun dépôt Git n'est présent dans la source locale ou la copie. Le workflow GitHub Pages du produit GRS est encore dans la copie ; il faudra le remplacer avant la première publication du nouveau dépôt.
- Vérification locale dans la copie : `tsc -b` réussi, build Vite réussi. Le bundle JavaScript principal fait environ 723 Ko minifiés, 216 Ko gzip, avec un avertissement de taille. `vitest run --passWithNoTests` réussit mais ne trouve aucun test : ce résultat n'est pas une couverture de test.

## 2. Architecture actuelle

| Couche | Constat | Décision |
| --- | --- | --- |
| Application active | React 19, TypeScript strict, Vite 7, `HashRouter`, entrée `src/main.tsx` | KEEP puis REFACTOR |
| Interface | `src/App.tsx` : site, routes, galerie, connexion ; `src/AdminWorkspace.tsx` : back-office ; CSS global et CSS admin | REFACTOR en modules |
| Backend | Supabase Auth, PostgREST, Storage, fonctions SQL RPC ; six migrations SQL | KEEP comme référence métier, REPLACE pour le schéma SaaS |
| Données locales | Projets publics codés dans `App.tsx`, données de démonstration en mémoire dans `AdminWorkspace.tsx` | REPLACE par configuration et données de tenant ; garder des fixtures de test séparées |
| Assets | 43 fichiers publics, dont photos GRS et médias de démonstration ; URLs Supabase GRS codées en dur | REPLACE avant déploiement Obtura |
| Déploiement | GitHub Pages sur `main` ; variables publiques Supabase au build | REPLACE par déploiement et backend distincts |
| Reliquats de scaffold | `app/`, `next.config.ts`, `db/schema.ts` vide, `drizzle/`, `components/ui/`, `vendor/`, scripts Sites | REMOVE après vérification des imports ; ne sont pas l'application Vite active |

La base actuelle est un produit mono-studio : aucune table `organizations`, `memberships`, `subscriptions` ou `plan_features`, et aucune entité métier ne porte `organization_id`. `profiles.role` est global. L'interface utilise `any` pour une partie importante des données et concentre de nombreuses opérations dans deux gros fichiers à lignes très longues.

## 3. Routes et parcours

Routes actives dans `src/App.tsx` : `/`, `/portfolio`, `/portfolio/photo`, `/portfolio/video`, `/projets/:slug`, `/services`, `/services/:slug`, `/formation`, `/formation/:slug`, `/a-propos`, `/contact`, `/demande`, `/client/:token`, `/admin/*`. Le reste retombe sur le portfolio. Avec `HashRouter`, l'URL réelle contient `#/...` : acceptable pour GRS sur GitHub Pages, insuffisant pour les futures pages SEO et les sous-domaines de studios.

- **Vitrine** : portfolio photo/film, projets, services, formation, à propos, contact, demande de projet. La vitrine mélange projets réels codés en dur et projets publiés dans Supabase. L'anglais n'est implémenté que sur une partie des écrans. Le thème clair existe mais l'état reste local au composant d'en-tête.
- **Galerie client** : lien + PIN + expiration vérifiés par `get_client_gallery`; téléchargement individuel et en rafale ; sélection et approbation affichées. Les sélections, commentaires et approbations ne sont pas enregistrés depuis l'interface. Le bouton « demander une correction » n'a pas de traitement visible.
- **Studio Manager** : dashboard, clients, projets, devis, factures, paiements manuels, planning de shoots, équipe, matériel, médiathèque, liens de livraison, brouillons de communication et statistiques. Les emails passent par `mailto:` et WhatsApp par `wa.me` : aucun fournisseur d'envoi n'est intégré.
- **Booking** : formulaire de demande, sans catalogue de créneaux, disponibilité, réservation transactionnelle, mini-sessions ni acompte en ligne.

## 4. Inventaire des données

Migrations : `001_initial_schema.sql` à `006_delivery_and_assets.sql`.

| Domaine | Tables/fonctions présentes | État produit |
| --- | --- | --- |
| Identité | `profiles`, Supabase Auth, `is_studio_admin()` | Rôle global ; pas d'inscription libre, de studio ou de permissions granulaires |
| Vitrine | `projects`, `project_categories`, `project_media`, `media_assets`, `services`, `site_settings`, `social_links` | Une marque GRS, slugs uniques globalement, contenu partiellement codé en dur |
| Clients/prospects | `clients`, `inquiries` | Contacts et demandes ; pas de pipeline, tâches ni historique des interactions |
| Devis/finance | `service_catalog`, `quotes`, `quote_items`, `invoices`, `invoice_items`, `payments` | Numéros générés côté client d'après la longueur des listes ; paiements manuels ; pas de contrat ni fournisseur de paiement |
| Galerie/livraison | `client_links`, `client_link_sessions`, `client_selections`, `client_comments`, `project_approvals`, `downloads`; RPC de création, ouverture et journalisation de téléchargement | Plusieurs tables de proofing existent sans parcours complet ; contrôle réel du téléchargement à revoir |
| Production | `shoots`, `shoot_team`, `teams`, `equipment` | Planning et inventaire basiques ; `teams` est un annuaire, pas des comptes utilisateurs ; pas de réservation de matériel |
| Communications | `communications` | Brouillons EMAIL/SMS seulement ; pas de moteur de campagne ni WhatsApp API |
| Statistiques/audit | `analytics_events`, `activity_logs` | Événements de base ; graphiques et tendance de démonstration ; journal d'audit non alimenté systématiquement |
| Formation | `training_courses`, `training_sessions`, `training_registrations` | Schéma présent ; pages publiques largement statiques |

Buckets SQL : `branding`, `portfolio-images`, `public-projects`, `training` publics ; `private-deliverables`, `documents` privés. Les uploads du back-office vont toujours vers `portfolio-images`, même pour des médias destinés à un projet client.

## 5. Sécurité et cohérence à corriger avant le SaaS

1. **Isolation entre studios absente (critique)** : `is_studio_admin()` autorise tout administrateur global sur toutes les lignes. Ajouter seulement `organization_id` ne suffira pas : toutes les policies, RPC, clés étrangères et chemins Storage devront imposer le même tenant.
2. **Fausse confidentialité des galeries (critique)** : `get_client_gallery` renvoie les chemins des fichiers ; le navigateur fabrique une URL publique via `getPublicUrl`. Les uploads passent dans le bucket public `portfolio-images`. Un PIN protège l'écran, pas l'objet média. Le téléchargement passe par l'URL publique même si `record_client_download` renvoie un échec. Les assets privés devront être dans un bucket privé et livrés via URL signée courte après autorisation serveur.
3. **Rôle par défaut trop puissant (critique)** : `profiles.role` a `SUPER_ADMIN` par défaut. Un flux d'inscription libre qui hériterait de ce schéma serait dangereux. Séparer profil utilisateur, appartenance au studio et rôle plateforme.
4. **RPC et quotas (élevé)** : les fonctions de galerie sont `security definer`; elles doivent vérifier tenant, média, droits, PIN/session, expiration et rate limiting. Les tables de sélections/commentaires n'ont pas de parcours d'écriture client complet. L'analytics public accepte des inserts libres selon le type d'événement.
5. **Finance (élevé)** : factures créées en deux requêtes non transactionnelles, numéros calculés côté client, mise à jour d'un paiement et du solde séparées. Des divergences ou collisions sont possibles. Les montants doivent être contrôlés côté serveur et les transitions journalisées.
6. **Authentification UI (élevé)** : `/admin` vérifie la présence d'une session, pas le rôle. RLS limite les données si correctement configurée, mais l'interface et l'onboarding doivent aussi gérer explicitement les permissions et les états sans accès.
7. **Lien direct avec la production GRS (critique pour la séparation)** : `src/App.tsx` contient l'URL du projet Supabase GRS et des chemins de photos GRS. Le workflow Pages et les guides nomment GRS. Publier la copie telle quelle exposerait la nouvelle marque à l'ancien backend et à ses médias.
8. **Scalabilité/performance (moyen)** : le dashboard charge de nombreuses tables en entier au montage ; aucune pagination. Une seule grande entrée JavaScript, pas de découpage de route. Les variantes `card`/`full` optimisent certaines images publiques, mais la galerie client charge les URLs originales.
9. **Qualité/maintenabilité (moyen)** : aucune suite de tests ; `any` et logique métier dans les composants ; plusieurs contrôles purement visuels ; guide Supabase qui ne mentionne que les deux premières migrations alors que six existent.

Ces observations sont établies dans le code. L'état réel des permissions et des données de la base distante doit être vérifié séparément avant toute migration ou publication.

## 6. Classement KEEP / REFACTOR / REPLACE / REMOVE / NEW

| Classe | Éléments | Raison |
| --- | --- | --- |
| KEEP | React/TypeScript/Vite, Framer Motion mesuré, formulaire de brief, squelette du Studio Manager, logique de devis/factures PDF comme référence, variantes d'image, expérience visuelle de la vitrine | Fondations et parcours déjà utiles ; pas de réécriture de framework nécessaire |
| REFACTOR | Routes, `App.tsx`, `AdminWorkspace.tsx`, système de design, service galerie, modèle de projets/clients/finance, états de chargement, accès admin | Extraire des modules, rendre la marque paramétrable, typer les données, fiabiliser les actions |
| REPLACE | Schéma SQL/RLS mono-studio, buckets publics pour livraisons, URLs et textes GRS, pipeline de build/déploiement, numérotation financière côté client, graphiques fictifs | Incompatibles avec isolation multi-tenant, confidentialité ou positionnement Obtura |
| REMOVE | Pages Next/scaffold inactifs, dépendances et composants UI inutilisés après vérification, données DEMO de la production Obtura, ancien workflow Pages dans le nouveau dépôt | Réduire ambiguïté, poids et risque de déploiement accidentel |
| NEW | Organizations, memberships, plans/quotas, signup/onboarding, leads, booking et créneaux, contrat, paiement provider, galerie privée autorisée, tests RLS/E2E, audit logs, API fournisseurs | Capacités indispensables au produit SaaS |

## 7. Limites de cet audit

La copie n'est pas encore un produit Obtura. Aucun schéma n'a été appliqué à Supabase et aucune donnée GRS n'a été déplacée. L'audit ne prouve pas que les fonctions actuellement en production correspondent exactement aux six fichiers SQL ; cela nécessitera une comparaison en lecture seule avec l'instance GRS et, ensuite, une instance Obtura distincte.
