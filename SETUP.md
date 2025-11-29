# PathoGen - Setup Guide

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (install with `npm install -g pnpm`)
- **PostgreSQL** >= 14.0

### Installation

1. **Install dependencies from root:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**

   **Backend** (`packages/backend/.env`):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   DATABASE_URL=postgresql://user:password@localhost:5432/pathogen
   JWT_SECRET=your-secret-key-change-in-production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   ENCRYPTION_KEY=your-encryption-key-32-chars
   ```

   **Frontend** (`packages/frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
   ```

3. **Start development servers:**
   ```bash
   pnpm dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📦 Project Structure

```
PathoGen/
├── packages/
│   ├── frontend/          # Next.js 15 frontend
│   │   ├── app/           # App Router pages
│   │   ├── lib/           # Utilities & design system
│   │   └── components/    # React components
│   └── backend/           # Express.js backend
│       ├── src/
│       │   ├── routes/    # API routes
│       │   ├── models/    # Database models
│       │   ├── services/  # Business logic
│       │   └── utils/     # Utilities
│       └── dist/          # Compiled output
├── Pathogen.json          # Design system reference
└── package.json           # Root workspace config
```

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
- `cd packages/backend && pnpm dev` - Start Express dev server
- `cd packages/backend && pnpm build` - Build TypeScript
- `cd packages/backend && pnpm start` - Run production build

## 🔧 Configuration

### Design System

The design system is defined in `Pathogen.json` and exported in `packages/frontend/lib/design-system.ts`.

Key design tokens:
- **Primary Color**: #1B7BFF (GovTech blue)
- **Secondary Color**: #38C684 (Health green)
- **Font**: Inter (UI), Satoshi (Headings), IBM Plex Sans (Multi-language)

### Database Setup (Coming in Phase 2)

PostgreSQL database schema will be managed with Drizzle ORM.

## 📝 Next Steps

1. **Phase 1 Tasks:**
   - [ ] Complete Gmail OTP authentication implementation
   - [ ] Set up Drizzle ORM with PostgreSQL
   - [ ] Configure Sentry for error monitoring

2. **Phase 2:**
   - [ ] Integrate disease datasets (ICMR, MoHFW, VRDL)
   - [ ] Build symptom logging system
   - [ ] Implement AI models for outbreak prediction

## 🐛 Troubleshooting

### Port Already in Use
If ports 3000 or 5000 are already in use:
- Frontend: Change port in `packages/frontend/package.json` scripts
- Backend: Change `PORT` in `packages/backend/.env`

### Dependency Issues
```bash
# Clean install
rm -rf node_modules packages/*/node_modules
pnpm install
```

## 📚 Documentation

- [Design System Reference](./Pathogen.json)
- [Development Roadmap](./README.md)

