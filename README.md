# PathoGen - Public Health Monitoring Platform

A modern, trustworthy healthcare platform for outbreak tracking, disease monitoring, and affordable medicine discovery across India.

## 📋 Overview

PathoGen is designed to:
- **Track and predict disease outbreaks** using AI and open data
- **Suggest affordable, authentic medicine alternatives** from verified sources
- **Promote community-based health transparency** across India

This project follows a 7-phase development roadmap. Currently, **Phase 1 (Foundation Setup)** is in progress.

## 🏗️ Project Structure

This is a monorepo managed with pnpm workspaces:

```
packages/
├── frontend/    # Next.js 15 frontend application
│   ├── app/     # App Router pages
│   ├── lib/     # Utilities & design system
│   └── components/ # React components (to be added)
└── backend/     # Express.js backend API server
    ├── src/
    │   ├── db/      # Database schemas (Drizzle ORM)
    │   ├── routes/  # API routes
    │   ├── utils/   # Utilities
    │   └── services/ # Business logic
    └── drizzle/  # Database migrations
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 ([Install pnpm](https://pnpm.io/installation))
- **PostgreSQL** >= 14.0

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd PathoGen
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   
   Create `packages/backend/.env`:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/pathogen
   JWT_SECRET=your-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ```

   Create `packages/frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

4. **Set up database:**
   ```bash
   cd packages/backend
   pnpm db:push  # Push schema to database
   ```

5. **Start development servers:**
   ```bash
   # From root directory
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📦 Packages

### Frontend (`packages/frontend`)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Design System**: Custom PathoGen design tokens (see `Pathogen.json`)
- **Icons**: Lucide Icons / Heroicons (planned)
- **Components**: shadcn/ui (planned)

### Backend (`packages/backend`)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + OTP (in progress)
- **Monitoring**: Sentry

## 🛠️ Available Scripts

### Root Level
- `pnpm dev` - Start all development servers
- `pnpm build` - Build all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format code with Prettier

### Frontend
- `cd packages/frontend && pnpm dev` - Start Next.js dev server
- `cd packages/frontend && pnpm build` - Build for production
- `cd packages/frontend && pnpm lint` - Run ESLint

### Backend
- `cd packages/backend && pnpm dev` - Start Express dev server with hot reload
- `cd packages/backend && pnpm build` - Build TypeScript
- `cd packages/backend && pnpm db:generate` - Generate database migrations
- `cd packages/backend && pnpm db:push` - Push schema changes to database
- `cd packages/backend && pnpm db:studio` - Open Drizzle Studio

## 📊 Development Roadmap

### ✅ Phase 1: Foundation Setup (In Progress)
- [x] Monorepo setup with pnpm
- [x] Next.js 15 frontend configuration
- [x] Express.js backend setup
- [x] Drizzle ORM with PostgreSQL schema
- [x] Sentry error monitoring
- [x] ESLint + Prettier configuration
- [x] Login page UI
- [ ] Complete authentication implementation

### ⏳ Phase 2: Core Disease Analytics Engine
- Disease dataset integration (ICMR, MoHFW, VRDL)
- Symptom logging system
- Data pipeline for social media scraping
- AI models for outbreak prediction

### ⏳ Phase 3-7: See `PHASE1_SUMMARY.md` for complete roadmap

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed setup instructions
- **[Phase 1 Summary](./PHASE1_SUMMARY.md)** - Phase 1 completion status
- **[Design System](./Pathogen.json)** - Complete design system reference

## 🎨 Design System

The design system is defined in `Pathogen.json` and follows these principles:
- **Primary Color**: GovTech Blue (#1B7BFF) - Trustworthy and official
- **Secondary Color**: Health Green (#38C684) - Positive health indicators
- **Typography**: Inter (UI), Satoshi (Headings), IBM Plex Sans (Multi-language)
- **Mobile-First**: Optimized for 70%+ mobile users

## 🔒 Security & Privacy

- AES-256 encryption for sensitive data
- DPDP 2023 compliance (planned)
- JWT-based authentication
- Secure password hashing with bcrypt

## 📝 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions or feedback, please contact the development team.

