# Proposition d'architecture — Obtura 2.0

Statut : **validé par le propriétaire le 2 octobre 2026**. La phase 1 locale a commencé ; aucune migration distante, aucun dépôt ou déploiement Obtura n'a encore été réalisé. Voir `phase1-progress.md`.

## 1. Frontières et environnements

Conserver React, TypeScript et Vite. Construire une application publique et un back-office modulaires partageant des composants de marque et des contrats typés. Utiliser un routage compatible avec vraies URLs (`/book/:studioSlug`, `/for-photographers`, etc.) sur un hébergeur avec fallback SPA/redirects ; garder l'ancien `HashRouter` uniquement dans GRS. Charger les routes métier à la demande et ajouter pagination/états vides/erreurs.

Créer pour Obtura un dépôt GitHub, un projet Supabase, des buckets, des variables d'environnement et une URL de production **distincts**. La copie locale porte encore l'URL et les assets GRS : le build Obtura doit refuser tout identifiant de projet GRS avant publication. Aucune donnée personnelle GRS ne doit être dupliquée automatiquement. Une vitrine Obtura neutre utilisera ses propres médias autorisés ou des maquettes sans données client.

Proposition de structure : `src/app` (routage et providers), `src/features/{auth,onboarding,crm,booking,finance,production,galleries,sites}`, `src/shared/{ui,api,types}`, `supabase/migrations`, `supabase/functions`, `tests/{unit,integration,e2e,rls}`. Les composants qui fonctionnent sont déplacés progressivement, sans réécrire l'ensemble de l'UI.

## 2. Identité, tenancy et permissions

- `profiles(id = auth.users.id, ...)` : données de personne, aucun rôle plateforme par défaut.
- `organizations(id, slug, name, country, currency, locale, status, brand_settings, ...)` : un studio.
- `memberships(id, organization_id, user_id, role_id, status, ...)` : appartenance et invitation ; contrainte unique organisation/utilisateur.
- `roles` et `permissions` : rôles standards Owner, Admin, Manager, Photographer, Videographer, Editor, Retoucher, Accountant, Assistant, Viewer ; matrice de capacités stockée et versionnée. Les rôles plateforme sont séparés des rôles studio.
- Tous les objets métier portent `organization_id NOT NULL`. Les clés étrangères composites ou contraintes/triggers empêchent de relier un projet du studio A à un client du studio B.
- Le tenant actif est choisi parmi les memberships de l'utilisateur ; jamais accepté comme seule preuve depuis le navigateur. Les fonctions SQL RLS vérifient `auth.uid()` et le membership actif du tenant de la ligne. Les écritures d'administration plateforme passent par un contexte serveur distinct et journalisé.
- Storage : chemin `organization_id/...`, bucket public pour la vitrine uniquement, bucket privé pour galeries et documents. La policy vérifie membership ou jeton de galerie côté serveur. Les liens signés sont courts, sans service-role côté client.

Tests obligatoires : deux studios avec utilisateurs et médias distincts ; lecture, écriture, jointure, RPC et Storage inter-tenant refusés ; changement de rôle et abonnement pris en compte ; accès galerie expiré ou révoqué refusé.

## 3. Modèle de données proposé

| Domaine | Tables cibles ou extensions | Invariants |
| --- | --- | --- |
| Plateforme | `organizations`, `profiles`, `memberships`, `roles`, `permissions`, `audit_logs`, `feature_flags` | Pas de super-admin implicite ; droits serveur |
| Abonnements | `plans`, `features`, `plan_features`, `plan_limits`, `pricing`, `subscriptions`, `usage_counters` | Free/Pro/Entreprise configurables ; quotas atomiques |
| CRM | `leads`, `lead_activities`, `tasks`, `clients`, `client_contacts` | Passage lead → client traçable ; tenant sur chaque ligne |
| Book | `services`, `packages`, `availability_rules`, `booking_slots`, `bookings`, `mini_sessions` | Réservation atomique ; anti double-booking ; fuseau du studio |
| Finance | `quotes`, `quote_items`, `contracts`, `signatures`, `invoices`, `invoice_items`, `payments`, `refunds` | Devise portée par l'objet ; numéros serveur ; écritures transactionnelles |
| Production | `projects`, `shoots`, `project_tasks`, `teams`, `shoot_team`, `equipment`, `equipment_reservations` | Allocation sans conflit ; lien client/projet intra-tenant |
| Livraison | `galleries`, `gallery_links`, `gallery_sessions`, `media_assets`, `project_media`, `selections`, `comments`, `approvals`, `downloads` | Jeton/PIN côté serveur ; accès signé ; pas d'original public |
| Vente/flows | `products`, `orders`, `order_items`, `automation_rules`, `automation_runs`, `message_templates` | Activation par flag et plan ; idempotence des actions |

Conserver autant que possible les noms et sémantiques de `clients`, `projects`, `quotes`, `invoices` et `payments` pour préparer une migration explicite, mais créer des migrations SaaS **uniquement** sur la nouvelle base. Réduire les mutations dispersées dans le client en fonctions serveur/RPC transactionnelles pour réservation, facturation, paiement, publication et délivrance de médias.

## 4. Intégrations

- `PaymentProvider` : interface commune pour intention de paiement, confirmation vérifiée, remboursement et webhook idempotent. Paiement manuel distinct de « payé en ligne ». Stripe et fournisseurs Mobile Money par pays se branchent sans changer la comptabilité.
- `WhatsAppProvider` : lien manuel comme premier niveau ; Cloud API/Twilio ensuite, avec consentement, modèles et journal des envois. `mailto:` est présenté comme ouverture du client email, pas comme envoi confirmé.
- `AIProvider` : désactivé par défaut ; données sensibles envoyées seulement après configuration et consentement du studio. Pas de clé API dans Vite.
- File d'événements/outbox pour confirmations, relances et webhooks ; idempotence, retries et historique. Les automations avancées viennent après stabilité du booking et des paiements.

## 5. Migration depuis GRS

La base GRS est une **source éventuelle**, pas le backend d'Obtura. D'abord comparer les six migrations du dépôt avec le schéma réel GRS, en lecture seule ; inventorier lignes, buckets, droits, statuts et médias. Ensuite écrire un export et un import répétables, avec mapping `ancien studio → organization GRS`, `admin → owner membership`, puis clients, projets, médias, devis, factures et paiements. Les IDs source sont conservés dans des colonnes de correspondance pour éviter doublons. Vérifier sommes, références et compteurs avant toute bascule. Les chemins Storage sont copiés vers les buckets Obtura avec contrôle de droits ; aucune URL publique GRS n'est réutilisée pour une galerie privée. GRS reste en service et ne subit aucune migration destructive.

La migration des données GRS vers Obtura est **optionnelle** au lancement public du SaaS ; elle requiert une décision produit sur l'usage des données et des médias. Une démonstration Obtura peut être construite avec fixtures anonymes.

## 6. Séquence exacte proposée et critères de sortie

| Phase | Travail | Sortie vérifiable |
| --- | --- | --- |
| 0 — Cadrage | Audit, vision, schéma, séparation des environnements ; validation du présent plan | Documents validés ; aucun service GRS modifié |
| 1 — Fondation | Nouveau dépôt et nouveau Supabase ; organisations, memberships, rôles, RLS, Storage privé, auth, onboarding minimal, flags/plans | Tests inter-tenant SQL verts ; création d'un studio et connexion réelles |
| 2 — Acquisition | Services, leads, pipeline, tâches, disponibilité, booking, mini-sessions de base | Un visiteur réserve un créneau sans double réservation ; lead/client/projet liés |
| 3 — Finances | Devis, contrats simples, factures, paiements manuels et provider abstraction ; numérotation transactionnelle | Devis → acompte → facture → solde réconciliés ; webhooks idempotents en test |
| 4 — Production | Projets, planning, équipes, tâches, inventaire et réservations de matériel | Une production complète et allocations sans conflit |
| 5 — Livraison | Upload optimisé, bucket privé, variantes, galerie PIN/expiration, favoris, commentaires, validation, téléchargement signé | Lien expiré refusé ; original non public ; test de livraison bout en bout |
| 6 — Commercialisation | Store, upsells, pricing configurable, limites et abonnement | Commande et fulfillment testés ; Free/Pro/Entreprise appliqués côté serveur |
| 7 — Communication | WhatsApp provider, templates, outbox et automations | Envois tracés, retries maîtrisés, opt-in respecté |
| 8 — Pilotage | Insights sur données réelles et métriques d'usage | Chiffres comparables aux transactions ; filtres fiables |
| 9 — Extension | Copilot sous consentement/quotas ; Event Mode ; PWA | Flags désactivables, tests de sécurité et performance |

Après chaque phase : migration dans la nouvelle base de test, build, tests adaptés, revue RLS, commit explicite. Le nouveau dépôt GitHub sera créé lorsque la fondation aura un nom, une séparation de configuration et un README cohérents ; la production ne sera déployée qu'après un parcours central vérifié. Les URLs finales seront alors fournies. Le dépôt GRS et son déploiement restent indépendants.

## 7. Risques et décisions à verrouiller

| Risque | Priorité | Réponse proposée |
| --- | --- | --- |
| Lien accidentel à Supabase ou Pages GRS | Critique | Variables distinctes, garde-fou de build, CI du nouveau dépôt, aucune reprise des secrets |
| Fuite entre tenants via RLS, RPC, jointures ou Storage | Critique | Schéma avec clés composites, politiques par tenant, tests avec deux studios |
| Galerie privée construite sur bucket public | Critique | Bucket privé, URLs signées temporaires, conversion des médias et audit des anciens chemins |
| Booking concurrent et paiements incohérents | Élevé | Verrous/contraintes SQL et transactions, webhooks idempotents |
| Migration de données GRS imprécise | Élevé | Export en lecture seule, mapping stable, test à blanc, rapprochement comptable |
| Contenus et photos GRS dans le marketing Obtura | Élevé | Marque et médias Obtura dédiés ; inventaire des droits avant réutilisation |
| Charge front et réseau lent | Moyen | Routes différées, pagination, vignettes, uploads reprenables |
| Périmètre trop large | Élevé | Critères de sortie par phase ; IA, Event et automatisations avancées sous flags |

## 8. Validation demandée

Valider cette séquence et le principe de **nouvelle base Supabase sans écriture sur GRS**. Les choix de fournisseur d'hébergement, de paiement et de messagerie peuvent être faits à la phase concernée. Après validation, commencer la phase 1 et créer le nouveau dépôt uniquement lorsque son contenu initial sera prêt.
