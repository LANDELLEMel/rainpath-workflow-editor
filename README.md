# RainPath — Workflow Editor

Éditeur visuel de workflows de relance patient pour laboratoires d'anatomopathologie.

## Stack technique

- **Frontend** : React 19 + TypeScript + Vite + Tailwind CSS v4 + @xyflow/react
- **Backend** : NestJS 11 + Prisma 7 + SQLite

## Installation

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run start:dev

# Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

## Utilisation

1. Ouvrir http://localhost:5173
2. L'éditeur se charge avec des workflows d'exemple
3. Glisser les canaux depuis le panneau de droite vers le canvas
4. Configurer les délais et messages de chaque étape

## Raccourcis clavier

- `Cmd+S` — Sauvegarder immédiatement
- `Cmd+N` — Créer un nouveau workflow
- `Delete` / `Backspace` — Supprimer le nœud sélectionné
- `Escape` — Désélectionner
