# PathoGen - Public Health Monitoring Platform

<div align="center">

![PathoGen Logo](https://via.placeholder.com/200x60/667eea/ffffff?text=PathoGen)

**A modern, trustworthy healthcare platform for outbreak tracking, disease monitoring, and affordable medicine discovery across India.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Development Guide](#development-guide)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

PathoGen is a comprehensive public health monitoring platform designed to:

- **Track and predict disease outbreaks** using AI and open data sources
- **Suggest affordable, authentic medicine alternatives** from verified sources (Jan Aushadhi, DAVA India)
- **Promote community-based health transparency** through citizen reporting
- **Provide real-time health alerts** and prevention measures
- **Support multiple Indian languages** for better accessibility
- **Ensure data security** with AES-256 encryption and DPDP Act compliance

The platform serves as a bridge between citizens, healthcare providers, and public health organizations to improve disease surveillance and healthcare accessibility across India.

---

## ✨ Features

### 🔐 Authentication & User Management
- Email-based user registration
- OTP (One-Time Password) verification system
- JWT-based authentication
- Password hashing with bcrypt
- Protected routes (User & Admin)
- User profile management

### 📊 Dashboard & Analytics
- Real-time disease outbreak tracking
- Infection Index (II) calculations
- Trending diseases visualization
- Interactive heatmaps by state/district
- Time-series charts for disease trends
- Health Risk Score for users

### 💊 Medicine Finder
- Search medicines by name, symptom, or disease
- Affordable alternatives from verified sources
- Price comparison across sources
- Pharmacy locator with maps
- Save medicines to cart
- Real-time medicine images

### 📝 Citizen Reporting System
- Symptom reporting with file uploads
- Admin verification panel
- Rewards and points system
- Certificate generation (after 100+ points)
- Leaderboard rankings

### 🔔 Alerts & Notifications
- Daily disease outbreak alerts
- Email notifications for local outbreaks
- Prevention measures recommendations
- Risk score notifications

### 🌐 Multi-Language Support
- Support for 11 Indian languages
- Language switcher
- Localized content throughout

### 🔒 Security Features
- AES-256-GCM data encryption
- JWT token authentication
- Secure password storage
- CORS protection
- Helmet security headers
- DPDP Act (2023) compliance

### 👨‍💼 Admin Panel
- User management
- Symptom report verification
- Medicine management
- Dashboard analytics
- Data management tools

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18.3 with Vite
- **Language**: JavaScript (JSX)
- **Routing**: React Router DOM
- **Styling**: CSS (Neumorphism + Glassmorphism design)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: GSAP (GreenSock Animation Platform)
- **HTTP Client**: Axios

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Drizzle ORM
- **Authentication**: JWT + OTP
- **Email Service**: Nodemailer (Gmail)
- **Validation**: Zod
- **Error Monitoring**: Sentry (optional)
- **PDF Generation**: Puppeteer
- **Cron Jobs**: node-cron
- **Security**: Helmet, CORS, bcryptjs

### Development Tools
- **Package Manager**: pnpm 8+
- **Monorepo**: pnpm workspaces
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Build Tool**: Vite (frontend), TypeScript compiler (backend)

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **pnpm** >= 8.0.0 ([Install Guide](https://pnpm.io/installation))
- **PostgreSQL** >= 14.0 ([Download](https://www.postgresql.org/download/))
- **Git** (for version control)

### Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 18.0.0

# Check pnpm version
pnpm --version  # Should be >= 8.0.0

# Check PostgreSQL version
psql --version  # Should be >= 14.0
```

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PathoGen
```

### 2. Install Dependencies

From the root directory, install all dependencies:

```bash
pnpm install
```

This will install dependencies for both frontend and backend packages.

### 3. Set Up Environment Variables

Create environment files for backend and frontend:

#### Backend Environment (`.env`)

Create `packages/backend/.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/pathogen

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-change-in-production

# Email Configuration (for OTP)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Encryption (Optional but recommended)
ENCRYPTION_KEY=your-encryption-key-32-characters-minimum

# Sentry Error Monitoring (Optional)
SENTRY_DSN=your-sentry-dsn-url
```

#### Frontend Environment (`.env.local`)

Create `packages/frontend/.env.local`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Sentry Error Monitoring (Optional)
VITE_SENTRY_DSN=your-sentry-dsn-url
```

> **Note**: See [Environment Variables](#environment-variables) section for detailed explanations of each variable.

### 4. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pathogen;

# Exit psql
\q
```

#### Initialize Database Schema

```bash
cd packages/backend

# Push database schema
pnpm db:push
```

#### Create Additional Tables (if needed)

```bash
# Create rewards tables
pnpm create:rewards-tables

# Create symptoms table
node scripts/create-symptoms-table.js

# Create user cart table
node scripts/create-user-cart-table.js
```

#### Seed Sample Data (Optional)

```bash
# Seed dashboard data
pnpm seed:dashboard

# Seed prevention measures
pnpm seed:prevention

# Seed sample medicines
pnpm seed:sample
```

---

## ⚙️ Environment Variables

### Backend Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `PORT` | No | Server port number | `5000` |
| `NODE_ENV` | No | Environment mode (`development`/`production`) | `development` |
| `FRONTEND_URL` | No | Frontend URL for CORS | `http://localhost:3000` |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string | - |
| `JWT_SECRET` | **Yes** | Secret key for JWT tokens (min 32 chars) | - |
| `EMAIL_USER` | **Yes** | Gmail address for sending OTPs | - |
| `EMAIL_PASSWORD` | **Yes** | Gmail App Password (not regular password) | - |
| `ENCRYPTION_KEY` | Recommended | AES encryption key (min 32 chars) | - |
| `SENTRY_DSN` | Optional | Sentry error monitoring DSN | - |

### Frontend Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `VITE_API_URL` | **Yes** | Backend API base URL | `http://localhost:5000` |
| `VITE_SENTRY_DSN` | Optional | Sentry error monitoring DSN | - |

### How to Get Values

#### 1. Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select **"Mail"** → **"Other (Custom name)"**
5. Enter "PathoGen"
6. Click **"Generate"**
7. Copy the 16-character password (remove spaces)

#### 2. Encryption Key

Generate using the provided script:

```bash
cd packages/backend
node scripts/generate-encryption-key.js
```

Copy the generated key to your `.env` file.

#### 3. JWT Secret

Generate a secure random string (minimum 32 characters):

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Setup

### PostgreSQL Installation

**Windows:**
1. Download from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set for the `postgres` user

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE pathogen;

# Verify creation
\l

# Exit
\q
```

### Update DATABASE_URL

Update `packages/backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pathogen
```

### Initialize Schema

```bash
cd packages/backend
pnpm db:push
```

---

## 🏃 Running the Project

### Development Mode

#### Option 1: Run Both Servers (Recommended)

From the root directory:

```bash
pnpm dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000

#### Option 2: Run Servers Separately

**Backend Server:**
```bash
cd packages/backend
pnpm dev
```

**Frontend Server (in a new terminal):**
```bash
cd packages/frontend
pnpm dev
```

### Production Build

#### Build All Packages

```bash
# From root directory
pnpm build
```

#### Run Production Backend

```bash
cd packages/backend
pnpm build
pnpm start
```

#### Run Production Frontend

```bash
cd packages/frontend
pnpm build
pnpm preview
```

### Verify Installation

1. **Check Backend**: Visit http://localhost:5000/health
   - Should return: `{"status":"ok","message":"PathoGen API Server is running"}`

2. **Check Frontend**: Visit http://localhost:3000
   - Should load the PathoGen homepage

3. **Check Database Connection**:
   ```bash
   cd packages/backend
   pnpm db:studio
   ```
   - Opens Drizzle Studio at http://localhost:4983

---

## 📁 Project Structure

```
PathoGen/
├── packages/
│   ├── backend/                    # Express.js Backend API
│   │   ├── src/
│   │   │   ├── db/
│   │   │   │   ├── schema/        # Database schemas (Drizzle ORM)
│   │   │   │   └── index.ts       # Database connection
│   │   │   ├── routes/            # API route handlers
│   │   │   ├── services/          # Business logic
│   │   │   ├── middleware/        # Express middleware
│   │   │   ├── utils/             # Utility functions
│   │   │   └── index.ts           # Express app setup
│   │   ├── scripts/               # Utility scripts
│   │   ├── public/                # Public assets
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/                   # React Frontend Application
│       ├── src/
│       │   ├── pages/             # Page components
│       │   ├── components/        # Reusable components
│       │   ├── contexts/          # React contexts
│       │   ├── utils/             # Utility functions
│       │   ├── styles/            # CSS stylesheets
│       │   ├── translations/      # Multi-language support
│       │   ├── App.jsx            # Main App component
│       │   └── main.jsx           # Entry point
│       ├── public/                # Static assets
│       ├── package.json
│       └── vite.config.js
│
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # pnpm workspace config
└── README.md                       # This file
```

### Key Directories

- **`packages/backend/src/routes/`**: API endpoint definitions
- **`packages/backend/src/services/`**: Business logic and service layer
- **`packages/backend/src/db/schema/`**: Database table definitions
- **`packages/frontend/src/pages/`**: Main page components
- **`packages/frontend/src/components/`**: Reusable UI components
- **`packages/frontend/src/utils/`**: Frontend utility functions

---

## 📜 Available Scripts

### Root Level Scripts

```bash
pnpm dev          # Start all development servers (backend + frontend)
pnpm build        # Build all packages for production
pnpm lint         # Lint all packages
pnpm format       # Format code with Prettier
```

### Backend Scripts

```bash
cd packages/backend

pnpm dev                    # Start development server with hot reload
pnpm build                  # Build TypeScript to JavaScript
pnpm start                  # Start production server
pnpm lint                   # Run ESLint
pnpm type-check             # Type check without building

# Database Scripts
pnpm db:generate            # Generate database migrations
pnpm db:push                # Push schema changes to database
pnpm db:migrate             # Run database migrations
pnpm db:studio              # Open Drizzle Studio (database GUI)

# Data Scripts
pnpm seed                   # Seed large-scale mock data
pnpm seed:sample            # Seed sample data
pnpm seed:dashboard         # Seed dashboard data
pnpm seed:prevention        # Seed prevention measures

# Utility Scripts
pnpm create:rewards-tables  # Create rewards tables
pnpm scrape:medicines       # Scrape medicine data
pnpm check-port             # Check if port 5000 is in use
pnpm kill-port              # Kill process on port 5000
```

### Frontend Scripts

```bash
cd packages/frontend

pnpm dev          # Start Vite development server
pnpm build        # Build for production
pnpm preview      # Preview production build
```

---

## 📚 API Documentation

### Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

### Main Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

#### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/trending-diseases` - Trending diseases
- `GET /api/dashboard/infection-index` - Infection Index data
- `GET /api/dashboard/heatmap-data` - Heatmap data by location

#### Medicines
- `GET /api/medicines/search` - Search medicines
- `GET /api/medicines/:id` - Get medicine details
- `GET /api/medicines/alternatives/:id` - Get alternatives

#### Symptoms
- `POST /api/symptoms/report` - Submit symptom report
- `GET /api/symptoms/my-reports` - Get user reports
- `GET /api/symptoms/reports` - Get all reports (Admin)

#### Rewards
- `GET /api/rewards/me` - Get user rewards
- `GET /api/rewards/leaderboard` - Get leaderboard
- `POST /api/rewards/certificate/claim` - Claim certificate
- `GET /api/rewards/certificate/download` - Download certificate PDF

#### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `PUT /api/admin/symptoms/:id/verify` - Verify symptom report
- `POST /api/admin/medicines` - Add medicine
- `PUT /api/admin/medicines/:id` - Update medicine

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "ok",
  "message": "PathoGen API Server is running"
}
```

---

## 🔧 Development Guide

### Adding a New Feature

1. **Backend**:
   - Create route in `packages/backend/src/routes/`
   - Add service logic in `packages/backend/src/services/`
   - Update database schema if needed in `packages/backend/src/db/schema/`
   - Add validation using Zod schemas

2. **Frontend**:
   - Create page component in `packages/frontend/src/pages/`
   - Add API call in `packages/frontend/src/utils/api.js`
   - Add styles in `packages/frontend/src/styles/`
   - Add translations in `packages/frontend/src/translations/`

### Code Style

- Use ESLint for linting
- Use Prettier for formatting
- Follow TypeScript best practices
- Write descriptive commit messages

### Database Migrations

```bash
cd packages/backend

# Generate migration after schema changes
pnpm db:generate

# Apply migrations
pnpm db:push
```

---

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
cd packages/backend
pnpm kill-port    # Kills process on port 5000
# OR
pnpm check-port   # Check what's using the port
```

### Database Connection Error

**Error**: `Connection refused` or `database does not exist`

**Solutions**:
1. Verify PostgreSQL is running:
   ```bash
   # Windows
   services.msc  # Check PostgreSQL service

   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Check DATABASE_URL in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/pathogen
   ```

3. Verify database exists:
   ```bash
   psql -U postgres -l  # List databases
   ```

### Email Not Sending

**Error**: OTP emails not being sent

**Solutions**:
1. Verify Gmail App Password (not regular password)
2. Check EMAIL_USER and EMAIL_PASSWORD in `.env`
3. Ensure 2-Step Verification is enabled
4. Check email service logs in backend console

### Frontend Not Connecting to Backend

**Error**: `Network Error` or `CORS error`

**Solutions**:
1. Verify backend is running on port 5000
2. Check `VITE_API_URL` in `packages/frontend/.env.local`
3. Verify CORS settings in `packages/backend/src/index.ts`
4. Check browser console for specific error

### Dependencies Installation Issues

**Error**: `peer dependency` warnings

**Solution**:
```bash
# Clean install
rm -rf node_modules packages/*/node_modules
pnpm install
```

---
admin access:-
      - **Email**: `admin@pathogen.com`
      - **Password**: `Admin@123456`

## 🤝 Contributing

This is a private project. For questions or feedback, please contact the development team.

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Run linter and formatter
5. Commit with descriptive messages
6. Push and create pull request

---

## 📄 License

Private - All rights reserved

---

## 📞 Support

For issues, questions, or contributions, please contact the development team.

---

## 🎉 Acknowledgments

- Design system based on modern healthcare UI/UX principles
- Built with community health in mind
- Designed for accessibility across India

---

**Last Updated**: 2024

**Version**: 1.0.0

---

<div align="center">

Made with ❤️ for Public Health in India

</div>
