# CLAUDE.md - GillesCobigo (Site portfolio)

> Ce fichier définit les règles de travail pour Claude Code sur ce projet.
> Il complète le CLAUDE.md global sans le dupliquer.

---

## Contexte du projet

Site portfolio personnel de Gilles Cobigo, développeur.
Remplace le site WordPress actuel comme page de présentation principale.
Déployé sur `gillescobigo.com`.

Cible : lead devs, CTOs, recruteurs ESN qui évaluent un profil technique.
Objectif : qu'ils repartent avec une réponse claire à "est-ce que ce profil colle avec ce qu'on fait ?"

**Priorité absolue : vitesse d'exécution.** Le site doit être en ligne rapidement. Le design et le contenu priment sur la perfection technique.

---

## Stack

- React 18 + TypeScript + Vite
- Tailwind + shadcn/ui
- Framer Motion (animations scroll + modales)
- Pas de backend - tout est statique ou appels API externes
- Déploiement : Vercel sur `gillescobigo.com`

---

## APIs externes

- API WordPress native : articles (transitoire, migration MDX à venir)
- API GitHub publique : commits récents, dernière activité
- BDD compétences (Supabase) : données du radar SkillsRadar (à connecter plus tard)

---

## Pages

- `/` - Home : hero split, stats GitHub live, section projets, section articles, contact
- `/projects` - liste complète des projets
- `/articles` - articles depuis WordPress API
- `/contact` - formulaire, liens LinkedIn + GitHub, disponibilité + mobilité

---

## Design - Split identity (obligatoire, pas de variation)

La hero section est divisée en deux moitiés côte à côte :

**Gauche - BTP** (fond #2C1810, tons ocre/terre)

- Dates : 2011 - 2022
- Titre : BIM Manager
- Projets cliquables : Mareterra Monaco, TPR2 Marseille, MRS3
- Tags : Maquette numérique, 100+ modèles, Bouygues
- Chaque projet ouvre une modale Framer Motion avec image de fond semi-transparente + texte

**Droite - Dev** (fond #0A0A0A, tons blanc/gris)

- Dates : 2022 - aujourd'hui
- Titre : Développeur
- Projets cliquables : Cerithe, Nexio, ChouxFleurs, VPS Hetzner
- Tags : TypeScript, Node.js, React, Claude Code, Docker, Nginx
- Chaque projet ouvre une modale avec description + stack + liens

**Sous le split** - section headline fond clair (#F8F5F0) :
"La rigueur du terrain, la précision du code."
Sous-texte court + deux boutons : "Voir mes projets" et "Télécharger le CV"

**Navbar** - sticky, fond #0A0A0A, logo "Gilles Cobigo" à gauche, liens Projets / Articles / Contact, bouton "Me contacter" avec bordure corail (#D85A30). Toggle dark/light mode. Dark par défaut.

---

## Contenu des modales

**Mareterra Monaco :**
"Extension en mer de Monaco. BIM Manager sur plus de 100 maquettes numériques interconnectées. Coordination de la synthèse technique et résolution de conflits de données complexes. Projet à 2 milliards €."

**TPR2 Marseille :**
"Rénovation de l'université de Luminy. Conventions BIM, contrôle des maquettes multi-lots, gestion de la synthèse technique avec Solibri et Navisworks."

**MRS3 :**
"Projet MRS3 Marseille. Coordination BIM et résolution de conflits entre lots sur un projet de grande envergure."

**VPS Hetzner :**
"VPS Hetzner Ubuntu 24.04. Docker, Nginx reverse proxy, Certbot SSL avec renouvellement automatique. Sous-domaines dédiés par projet. Infrastructure personnelle, indépendance totale des outils SaaS."

Images des modales BTP = placeholders pour l'instant. Gilles les remplacera manuellement.

---

## Projets

- **Cerithe** : carnet de santé numérique du bâtiment. TypeScript, Node.js, Express, Prisma, React. MVP juillet 2026.
- **Nexio** : app suivi recherche d'emploi avec IA intégrée. Même stack + Claude API.
- **ChouxFleurs** : app agentique gestion liste de naissance. NestJS, React, Supabase. En prod.

---

## Composants clés

### SkillsRadar.tsx

Déjà codé - ne pas recréer. Prévoir un emplacement `<SkillsRadar />` dans la Home.
Radar SVG interactif, 6 sections de compétences, données hardcodées pour l'instant.

### Score de matching stack

Le visiteur coche les technos de sa stack.
Matrice de proximité : Vue.js = React à 80%, NestJS = Express à 85%, ASP.NET = Express+NestJS à 70%, EF = Prisma à 85%.
Résultat : score + message contextuel.

### Easter egg

`console.log` ou commentaire HTML caché pour les devs qui inspectent le code.

---

## Règles de workflow

- `main` est protégée - PR obligatoire avant merge
- Tout le dev sur `dev` - preview Vercel auto sur chaque push
- Plan mode avant toute génération
- Un seul sujet par session CC
- Périmètre strict : CC ne modifie que les fichiers du plan validé

---

## Règles de contenu

- Zéro "junior" dans les textes
- Zéro tiret quadratin dans les textes visibles
- Zéro formulations corporate
- Ton direct, humain, avec des apartés personnels

---

## Journal des décisions (ADR)

- [2026-06-18] Design : Split identity BTP/Dev - fond ocre gauche, fond noir droite
- [2026-06-18] Pas de backend dédié - tout statique ou API externes
- [2026-06-18] WordPress conservé pour les articles pendant la migration MDX
- [2026-06-18] Déploiement sur gillescobigo.com (domaine principal, pas un sous-domaine)
- [2026-06-18] Projets retenus : Cerithe, Nexio, ChouxFleurs - Labelr et Baticoop retirés
