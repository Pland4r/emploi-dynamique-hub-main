# Emploi Dynamique Hub

Une plateforme web moderne qui interconnecte candidats et recruteurs dans un écosystème dynamique d'emploi.

## 🚀 Fonctionnalités

### Pour les Candidats
- **Création de CV interactif** : Créez votre CV professionnel avec un éditeur visuel
- **Téléchargement PDF** : Générez et téléchargez votre CV en format PDF
- **Modification facile** : Modifiez votre CV à tout moment pour ajouter de nouvelles expériences
- **Recommandations intelligentes** : Recevez des offres d'emploi personnalisées basées sur votre profil
- **Score de compatibilité** : Visualisez votre taux de correspondance avec chaque offre
- **Candidature simplifiée** : Postulez en un clic avec lettre de motivation
- **Suivi des candidatures** : Suivez l'état de vos candidatures en temps réel

### Pour les Recruteurs
- **Création d'offres d'emploi** : Interface intuitive pour publier des offres complètes
- **Gestion des candidatures** : Consultez et gérez toutes les candidatures reçues
- **Classement automatique** : Les profils sont classés par score de compatibilité
- **Visualisation des CV** : Consultez les CV complets des candidats
- **Gestion des statuts** : Mettez à jour le statut des candidatures (en attente, consultée, acceptée, etc.)
- **Programmation d'entretiens** : Planifiez des entretiens directement depuis la plateforme

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **React Router** pour la navigation
- **React Query** pour la gestion d'état serveur
- **Lucide React** pour les icônes

### Backend
- **Node.js** avec TypeScript
- **Express.js** pour l'API REST
- **MySQL** pour la base de données
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe
- **Puppeteer** pour la génération de PDF
- **CORS** pour la gestion des requêtes cross-origin

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- MySQL (version 8.0 ou supérieure)
- npm ou yarn

## 🚀 Installation

### 1. Cloner le repository
```bash
git clone <repository-url>
cd emploi-dynamique-hub
```

### 2. Configuration de la base de données
```bash
# Accédez au dossier backend
cd backend

# Installez les dépendances
npm install

# Configurez votre fichier .env
cp .env.example .env
```

Modifiez le fichier `.env` avec vos paramètres de base de données :
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=emploi_dynamique
JWT_SECRET=votre_secret_jwt
PORT=5000
```

### 3. Initialisation de la base de données
```bash
# Créez la base de données et les tables
npm run init-db
```

### 4. Démarrage du backend
```bash
# Mode développement
npm run dev

# Ou mode production
npm run build
npm start
```

### 5. Configuration du frontend
```bash
# Retournez à la racine du projet
cd ..

# Installez les dépendances frontend
npm install
```

### 6. Démarrage du frontend
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📊 Structure de la Base de Données

### Tables principales
- **users** : Informations des utilisateurs (candidats et recruteurs)
- **profiles** : Profils détaillés avec CV, compétences, expériences
- **jobs** : Offres d'emploi publiées par les recruteurs
- **applications** : Candidatures des utilisateurs avec scores de compatibilité
- **job_recommendations** : Recommandations d'emploi personnalisées

## 🔧 Configuration Avancée

### Variables d'environnement

#### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=emploi_dynamique
JWT_SECRET=votre_secret_jwt_super_securise
PORT=5000
NODE_ENV=development
```

#### Frontend (vite.config.ts)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

## 📱 Utilisation

### Inscription et Connexion
1. Accédez à la page d'accueil
2. Choisissez votre rôle (Candidat ou Recruteur)
3. Créez votre compte avec email et mot de passe
4. Connectez-vous à votre espace personnel

### Pour les Candidats
1. **Créer votre CV** :
   - Accédez à votre tableau de bord
   - Cliquez sur "Créer mon CV"
   - Remplissez vos informations personnelles, expériences, formation
   - Sauvegardez votre CV

2. **Recevoir des recommandations** :
   - Votre CV génère automatiquement des recommandations d'emploi
   - Consultez les offres avec leur score de compatibilité
   - Postulez en un clic

3. **Suivre vos candidatures** :
   - Consultez l'état de vos candidatures
   - Recevez des notifications de mise à jour

### Pour les Recruteurs
1. **Publier une offre** :
   - Accédez à votre tableau de bord
   - Cliquez sur "Nouvelle offre"
   - Remplissez les détails du poste
   - Publiez l'offre

2. **Gérer les candidatures** :
   - Consultez les candidatures reçues
   - Les profils sont classés par score de compatibilité
   - Visualisez les CV complets
   - Mettez à jour les statuts

## 🔒 Sécurité

- Authentification JWT sécurisée
- Hachage des mots de passe avec bcrypt
- Validation des données côté serveur
- Protection CORS configurée
- Gestion des erreurs centralisée

## 🚀 Déploiement

### Backend (Production)
```bash
cd backend
npm run build
npm start
```

### Frontend (Production)
```bash
npm run build
# Les fichiers sont générés dans le dossier dist/
```

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Contactez l'équipe de développement

## 🎯 Roadmap

- [ ] Notifications en temps réel
- [ ] Système de messagerie entre candidats et recruteurs
- [ ] Intégration avec LinkedIn
- [ ] Système de recommandations avancé avec IA
- [ ] Application mobile React Native
- [ ] Analytics et tableaux de bord avancés
- [ ] Système de paiement pour offres premium
- [ ] Intégration avec des outils de recrutement externes

---

**Emploi Dynamique Hub** - Connecter les talents aux opportunités 🚀
