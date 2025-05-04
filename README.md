# CRM pour Cabinet de Recrutement

Une application web simple et efficace pour la gestion des candidats dans un cabinet de recrutement.

## Fonctionnalités

- Ajout de candidats avec informations complètes ou partielles
- Recherche avancée par nom, prénom, compétences, etc.
- Interface utilisateur moderne et réactive
- Base de données SQLite pour une installation facile
- Filtrage par fonction et secteur d'activité

## Structure du projet

```
crm_recrutement/
├── backend/           # API Flask
│   ├── app.py         # Application backend
│   └── requirements.txt
├── frontend/          # Interface React
│   ├── src/           # Code source React
│   ├── package.json   # Dépendances NPM
│   └── vite.config.js # Configuration Vite
└── README.md
```

## Installation et démarrage

### Backend (Flask)

1. Accédez au répertoire backend
```
cd crm_recrutement/backend
```

2. Installez les dépendances Python
```
pip install -r requirements.txt
```

3. Lancez l'API
```
python app.py
```
Le serveur backend sera accessible à l'adresse http://localhost:5000

### Frontend (React)

1. Accédez au répertoire frontend
```
cd crm_recrutement/frontend
```

2. Installez les dépendances NPM
```
npm install
```

3. Démarrez le serveur de développement
```
npm run dev
```
L'application frontend sera accessible à l'adresse http://localhost:3000

## Points importants

- L'application permet d'ajouter des candidats avec des informations incomplètes
- Les champs comme nom, prénom, email, etc. sont tous optionnels
- La recherche de candidats se fait sur tous les champs textuels
- L'application est conçue pour être simple d'utilisation et visuellement agréable
