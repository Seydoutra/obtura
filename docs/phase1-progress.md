# Phase 1 — Fondation Obtura

Date : 2 octobre 2026. Le plan d'architecture a été validé par le propriétaire.

## Réalisé dans la copie locale

- Nouvelle entrée applicative `src/obtura/main.tsx` et vitrine Obtura. L'ancien site GRS reste dans le code hérité, non utilisé par le build actif.
- Configuration de build qui bloque explicitement l'identifiant Supabase GRS et les paires de variables incomplètes. Le dossier `public/` GRS n'est pas embarqué. L'ancien workflow GitHub Pages a été retiré de cette copie.
- Anciennes migrations GRS déplacées sous `legacy/grs-supabase/` et comparées aux fichiers originaux : identiques. Nouvelle migration Obtura séparée : profils sans rôle global, organisations, memberships, création de studio transactionnelle, RLS et bucket privé.
- Interface d'inscription, connexion et création de studio branchée sur le **futur** projet Supabase Obtura. Sans projet distinct configuré, aucun formulaire de compte n'est présenté comme fonctionnel.
- Tests unitaires du garde-fou de configuration : 3 réussis. TypeScript et build réussis ; sortie de production : environ 360 Ko, sans fichiers média GRS ni URL de stockage GRS.
- Dépôt Git local initialisé pour Obtura ; seuls les fichiers du nouveau produit sont suivis. Workflow GitHub Pages prêt pour une prévisualisation statique sans Supabase, après création du dépôt distant.

## Encore requis pour terminer la phase 1

1. Connecter ou créer un projet Supabase **Obtura** indépendant. Le plugin Supabase n'est pas connecté à cette tâche. Ne jamais appliquer la migration sur `npqegxbgzcvgjrvkzodh` (GRS).
2. Appliquer `supabase/migrations/20261002000100_foundation.sql` dans cette nouvelle base, configurer Auth et les URLs de redirection, puis renseigner les variables publiques de la copie seulement.
3. Tester en base réelle deux comptes dans deux studios : les organisations, memberships et fichiers privés de l'un ne doivent être ni lus ni modifiés par l'autre. Tester aussi suspension/révocation et chemins Storage invalides.
4. Créer le dépôt GitHub distant Obtura et y pousser l'historique local. La prévisualisation statique peut être publiée avant Supabase ; l'ouverture des comptes attendra les tests RLS et un parcours compte/studio validé.
5. Ajouter les permissions plus fines, plans/flags et invitations d'équipe de la phase 1 avant de déclarer cette phase terminée.

Cette étape ne contient aucune migration, donnée ou secret importé de GRS. Les modules Book, finance, production et galeries ne sont pas encore implémentés dans Obtura.
