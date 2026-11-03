# FANILO

*Ce projet a été réalisé dans le cadre du Hackathon FANILO 2026 à 42 Antananarivo.*

---

## Description

**FANILO** est une application d'information et de vérification destinée aux journalistes et aux professionnels des médias à Madagascar.

À l'heure où la désinformation circule vite, en malgache comme en français, sur Facebook et Google, un journaliste a peu de temps pour trier ce qu'il reçoit. FANILO l'aide à **repérer ce qui mérite d'être vérifié**.

### Fonctionnalités

- **Actualités** : liste d'articles filtrable par catégorie, avec pagination.
- **Détail d'un article** : contenu, commentaires et articles similaires.
- **Assistant de vérification** : un chatbot flottant, visible sur toutes les pages. L'utilisateur colle un texte ou une rumeur, et l'assistant indique les signaux d'alerte à vérifier.
- **Gestion de la conversation** : l'historique est conservé quand on ferme le chat, et un bouton permet de l'effacer.

> FANILO ne dit pas ce qui est vrai ou faux : il indique ce qui mérite d'être vérifié.

### Stack technique

| Partie | Technologie |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | FastAPI (Python) |

---
## Limites de l'application

FANILO est un prototype réalisé en 48 heures : il aide à repérer ce qui mérite d'être vérifié, mais il ne remplace ni le travail d'un journaliste ni une vérification rigoureuse des faits. Ses principales limites sont :

- Pas de verdict de vérité : l'assistant signale des signaux d'alerte (pression à partager, langage alarmiste, absence de source...), il ne peut pas affirmer qu'une information est vraie ou fausse.
- Réponses de l'IA non garanties : l'assistant s'appuie sur un modèle d'IA, qui peut se tromper, passer à côté d'une rumeur ou donner une réponse imprécise. Ses réponses doivent toujours être recoupées avec des sources fiables.
- Couverture limitée du malgache : la compréhension du malgache est moins fiable que celle du français, et les expressions locales ou récentes peuvent ne pas être reconnues.
- Texte uniquement : la vérification d'images, de vidéos et de contenus audio (y compris générés par IA) n'est pas encore prise en charge.
- Dépendance au backend et au réseau : sans le serveur FastAPI lancé et une connexion fonctionnelle, l'assistant ne répond pas.
- Données de démonstration : certaines pages (actualités, commentaires) utilisent des contenus d'exemple et ne reflètent pas un flux d'actualités réel.
- Pas de sécurité renforcée : pas de gestion complète des comptes, ni de limitation d'usage ni de protection avancée de l'API, ce qui est à prévoir avant un déploiement réel.

## Instructions

### Prérequis

- **Python 3** et **make** (pour le backend)
- **Node.js** (version LTS recommandée) et **npm** (pour le frontend)
- **Git**

Vérification rapide :

```bash
python3 --version
make --version
node -v
npm -v
```

### 1. Récupérer le projet

```bash
git clone <URL_DU_DEPOT>
cd <NOM_DU_DOSSIER>
```

### 2. Lancer le backend (FastAPI)

Entrez dans le dossier du code source du FastAPI :

```bash
cd <dossier-fastapi>
```

Puis lancez les trois commandes dans cet ordre :

```bash
make install   # installe les dépendances
make migrate   # prépare la base de données
make run       # démarre le serveur
```

Par défaut, l'API est disponible sur **http://localhost:8000**.

> Laissez ce terminal ouvert : le backend doit rester lancé pendant que vous utilisez l'application.

### 3. Lancer le frontend (Next.js)

Ouvrez un **second terminal**, puis entrez dans le dossier du code source du Next.js :

```bash
cd <dossier-nextjs>
```

Installez les dépendances et démarrez le projet :

```bash
npm install
npm run dev
```

L'application est disponible sur **http://localhost:3000**.

### 4. Configurer l'adresse de l'API

Le frontend doit savoir où se trouve le backend. Créez un fichier `.env.local` à la racine du dossier Next.js :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Puis redémarrez `npm run dev` : Next.js ne lit ce fichier qu'au démarrage.

### 5. Utiliser l'application

1. Ouvrez **http://localhost:3000** dans votre navigateur.
2. Parcourez les actualités et ouvrez un article pour lire son contenu et ses commentaires.
3. Cliquez sur le bouton **💬** en bas à droite pour ouvrir l'assistant de vérification.
4. Collez un texte ou une rumeur dans le chat et envoyez-le.
5. L'icône 🗑️ dans l'en-tête du chat efface la conversation.

### Résumé des commandes

| Étape | Dossier | Commandes |
|---|---|---|
| Backend | `<dossier-fastapi>` | `make install` → `make migrate` → `make run` |
| Frontend | `<dossier-nextjs>` | `npm install` → `npm run dev` |

| Service | Adresse |
|---|---|
| API FastAPI | http://localhost:8000 |
| Application Next.js | http://localhost:3000 |

### Problèmes fréquents

**Le chat répond « Impossible de joindre le service »**
Le backend n'est pas lancé, ou l'adresse dans `NEXT_PUBLIC_API_URL` est incorrecte.

**Erreur CORS dans la console du navigateur (F12)**
Le backend doit autoriser l'adresse du frontend (`http://localhost:3000`) dans sa configuration CORS.

**`make: command not found`**
Installez `make` (par exemple `sudo apt install make` sur Ubuntu).

**`make migrate` échoue**
Vérifiez que `make install` s'est terminé sans erreur et que la configuration de la base de données (fichier `.env` du backend) est correcte.

**Le port 3000 ou 8000 est déjà utilisé**
Fermez l'ancien processus, ou lancez le serveur sur un autre port.

**Les modifications du `.env.local` ne sont pas prises en compte**
Arrêtez `npm run dev` (Ctrl+C) puis relancez-le.

---

## Resources

### Documentation

- [Next.js](https://nextjs.org/docs) : framework du frontend
- [React](https://react.dev/) : bibliothèque d'interface
- [Tailwind CSS](https://tailwindcss.com/docs) : mise en forme
- [TypeScript](https://www.typescriptlang.org/docs/) : typage du code
- [FastAPI](https://fastapi.tiangolo.com/) : framework du backend
- [Node.js](https://nodejs.org/) et [nvm](https://github.com/nvm-sh/nvm) : installation de Node sans droits administrateur

### Contexte du projet

- Hackathon FANILO 2026, porté par l'Institut français de Madagascar et le service de presse de l'Ambassade de France, en partenariat avec 42 Antananarivo.

### Utilisation de l'IA

Une IA (Claude) a été utilisée comme aide pendant le développement : idée et cadrage du projet, génération de composants d'interface (liste d'actualités, détail d'un article, chatbot), explications sur Next.js, Git et l'intégration avec l'API, et rédaction de la documentation. Le code a été relu, testé et adapté par l'équipe.

---

## Équipe

| Nom | Rôle |
|---|---|
| _RANDRIANADO Yannick Kevin_ | _Frontend_ |
| _RAKOTOARISOA Finoana Charles_ | _Creation du chatbot_ |
| _RAKOTONIAINA Safidinirina Anthonio_ | _Front end_ |
| RAKOTOMAMPIONONA  Fitahiaina Herizo | _Creation du backend_ |
