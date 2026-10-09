# Obtura 2.0

Obtura est une nouvelle plateforme pour les créateurs visuels. Ce dossier est une **copie de travail distincte** de `../grs-vision` ; il ne doit jamais être relié au Supabase, au dépôt ni au déploiement GRS.

## État actuel

La vitrine, les pages dédiées d'inscription, de connexion et de réinitialisation du mot de passe, ainsi qu'un premier espace studio, sont en place. Ces pages utilisent Supabase Auth **uniquement si un projet Supabase Obtura distinct est configuré**. Sans cette configuration, les formulaires sont désactivés et la démo reste accessible. Les modules Book, Studio et Galleries affichés sur la vitrine restent conceptuels.

La base SaaS est préparée en deux migrations : `supabase/migrations/20261002000100_foundation.sql` (profils, studios, membres, stockage privé) et `supabase/migrations/20261009000100_saas_core.sql` (clients, projets, rendez-vous, galeries). Chaque ligne métier est liée à un studio avec Row Level Security ; les clés étrangères composites empêchent de relier des données appartenant à deux studios différents. La livraison publique par lien et la reconnaissance faciale **ne sont pas activées** dans cette phase.

Le répertoire `legacy/grs-supabase/` conserve les anciennes migrations GRS pour référence seulement. Ne les appliquez pas à Obtura. L'ancien code GRS se trouve toujours dans `src/App.tsx` et `src/AdminWorkspace.tsx` pour faciliter une migration sélective ; il n'est pas l'entrée active du site. Le dossier `public/` contient les médias GRS hérités, mais `publicDir: false` les exclut du build Obtura.

## Développement local

1. Installer les dépendances avec `pnpm install`.
2. Lancer `pnpm dev`.
3. Exécuter `pnpm test` puis `pnpm build`.

Pour brancher le backend ultérieurement :

1. Créer un projet Supabase **nouveau** nommé Obtura, sans réutiliser GRS Vision ni l'autre projet existant. Vérifier le coût récurrent avant de confirmer.
2. Appliquer les deux migrations Obtura dans l'ordre, uniquement dans ce nouveau projet. Vérifier la création des tables, les politiques RLS et le bucket `obtura-private`.
3. Dans Auth → URL Configuration, définir l'URL du site `https://seydoutra.github.io/obtura/` et l'autoriser comme URL de redirection pour les confirmations et réinitialisations. Garder la confirmation par email activée. Configurer un SMTP dédié avant ouverture publique : l'envoi par défaut Supabase est limité et non garanti pour la production.
4. Renseigner `VITE_SUPABASE_URL` et la clé publique `VITE_SUPABASE_ANON_KEY` dans `.env.local` pour le développement. Ne jamais placer une clé `service_role`, un mot de passe de base de données ou un secret serveur dans Vite ou dans Git. Le build de production peut exiger le backend avec `VITE_REQUIRE_BACKEND=true` une fois le lancement validé.
5. Tester avec deux comptes et deux studios distincts : aucune lecture ni écriture croisée ne doit réussir. Tester l'email de confirmation, la connexion, la déconnexion et le mot de passe oublié avant d'ouvrir les inscriptions.

Le workflow `.github/workflows/deploy-obtura-pages.yml` publie **une prévisualisation statique** sur GitHub Pages. Sans Supabase Obtura, il ne propose ni inscription active ni données GRS. Ce preview n'est pas le lancement du SaaS.

Le 9 octobre 2026, l'écran de création Supabase indiquait un coût additionnel de **10 $/mois** pour un troisième projet dans l'organisation Pro. L'utilisateur a choisi de poursuivre **sans créer ce projet ni engager ce coût pour le moment**. Aucun ancien workflow GRS n'est actif dans cette copie.

Documents de cadrage : [audit](docs/audit-v1.md), [vision](docs/product-vision.md), [architecture et phases](docs/architecture-v2-proposal.md).
