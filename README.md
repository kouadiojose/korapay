# KoraPay - Plateforme de Paiement Fintech

Plateforme de paiement en ligne permettant d'accepter les paiements Mobile Money (Orange, MTN, Wave, Moov) et Carte Bancaire en Afrique.

## Stack Technique

- **Backend**: Node.js, Express, TypeScript, Knex.js, PostgreSQL, Redis
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Infrastructure**: Docker, Docker Compose

## Fonctionnalites

- **Collecte de paiements**: Mobile Money (Orange, MTN, Wave, Moov) + Carte Bancaire
- **Transferts**: Envoi d'argent vers Mobile Money et comptes bancaires
- **Payouts**: Paiements en masse vers les beneficiaires
- **Dashboard Marchand**: Suivi des transactions, analytics, gestion des cles API
- **Page de checkout hebergee**: Page de paiement personnalisable
- **Webhooks**: Notifications en temps reel des evenements de paiement
- **KYC**: Verification d'identite des marchands
- **API REST**: API complete pour l'integration

## Demarrage Rapide

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- npm ou yarn

### Installation

```bash
# Cloner le repo
git clone https://github.com/kouadiojose/korapay.git
cd korapay

# Demarrer les services (PostgreSQL + Redis)
docker-compose up -d

# Backend
cd packages/backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# Frontend (dans un autre terminal)
cd packages/frontend
cp .env.example .env
npm install
npm run dev
```

### Acces

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api/v1

### Compte Admin par defaut

- Email: admin@korapay.com
- Mot de passe: Admin@123456

## Architecture

```
korapay/
├── packages/
│   ├── backend/          # API Express + TypeScript
│   │   ├── src/
│   │   │   ├── config/       # Configuration
│   │   │   ├── db/           # Migrations & seeds
│   │   │   ├── middleware/   # Auth, validation, rate limiting
│   │   │   ├── modules/      # Auth, Merchants, Payments, etc.
│   │   │   ├── providers/    # Orange, MTN, Wave, Moov, Card
│   │   │   ├── utils/        # Crypto, errors, pagination
│   │   │   └── types/        # TypeScript types
│   │   └── knexfile.ts
│   └── frontend/         # Next.js 14 + Tailwind
│       └── src/
│           ├── app/          # Pages (App Router)
│           ├── components/   # UI, Layout, Landing, Dashboard
│           ├── lib/          # API client, utils
│           ├── stores/       # Zustand stores
│           └── hooks/        # React hooks
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentification
- `POST /api/v1/auth/register` - Inscription
- `POST /api/v1/auth/login` - Connexion
- `GET /api/v1/auth/me` - Profil

### Paiements
- `POST /api/v1/charges/initialize` - Initialiser un paiement
- `GET /api/v1/charges/:reference` - Verifier un paiement
- `GET /api/v1/transactions` - Lister les transactions

### Transferts
- `POST /api/v1/transfers` - Initier un transfert
- `GET /api/v1/transfers` - Lister les transferts

### Marchands
- `GET /api/v1/merchants/profile` - Profil marchand
- `POST /api/v1/merchants/api-keys` - Generer des cles API

## Moyens de Paiement

| Fournisseur | Pays | Devises |
|-------------|------|---------|
| Orange Money | CI, SN, ML, BF, CM | XOF, XAF |
| MTN MoMo | CI, CM, GH, BJ, CG | XOF, XAF, GHS |
| Wave | SN, CI, ML, BF | XOF |
| Moov Money | CI, BJ, TG, NE | XOF, XAF |
| Visa/Mastercard | International | XOF, XAF, USD, EUR |

## Licence

Proprietary - Tous droits reserves.
