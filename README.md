# Obtura 2.0

Obtura est une nouvelle plateforme pour les créateurs visuels. Ce dossier est une **copie de travail distincte** de `../grs-vision` ; il ne doit jamais être relié au Supabase, au dépôt ni au déploiement GRS.

## État actuel

La nouvelle vitrine et l'entrée de compte Obtura sont en place. L'inscription, la connexion et la création d'un studio utilisent le nouveau schéma `supabase/migrations/20261002000100_foundation.sql`, **uniquement si un projet Supabase Obtura distinct est configuré**. Sans cette configuration, l'interface affiche honnêtement que l'ouverture des comptes est en préparation. Les modules Book, Studio et Galleries affichés sur la vitrine ne sont pas encore fonctionnels.

Le répertoire `legacy/grs-supabase/` conserve les anciennes migrations GRS pour référence seulement. Ne les appliquez pas à Obtura. L'ancien code GRS se trouve toujours dans `src/App.tsx` et `src/AdminWorkspace.tsx` pour faciliter une migration sélective ; il n'est pas l'entrée active du site. Le dossier `public/` contient les médias GRS hérités, mais `publicDir: false` les exclut du build Obtura.

## Développement local

1. Installer les dépendances avec `pnpm install`.
2. Lancer `pnpm dev`.
3. Exécuter `pnpm test` puis `pnpm build`.

Pour brancher le backend, créer un projet Supabase **nouveau**, appliquer la migration Obtura dans ce projet seulement, puis renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans un fichier `.env.local`. La configuration ne doit pas contenir l'identifiant du projet GRS. Le build de production peut exiger le backend avec `VITE_REQUIRE_BACKEND=true`.

Le workflow `.github/workflows/deploy-obtura-pages.yml` publie **une prévisualisation statique** sur GitHub Pages après création d'un dépôt Obtura séparé et activation de Pages avec la source « GitHub Actions ». Sans Supabase Obtura, il ne propose ni inscription active ni données GRS. Ce preview n'est pas le lancement du SaaS.

Avant l'ouverture des comptes : vérifier les RLS et le stockage avec deux studios réels dans une base de test, puis définir les URLs de redirection Auth. Aucun ancien workflow GRS n'est actif dans cette copie.

Documents de cadrage : [audit](docs/audit-v1.md), [vision](docs/product-vision.md), [architecture et phases](docs/architecture-v2-proposal.md).
