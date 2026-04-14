# RealEstateAI Platform 🚀

A production-ready, high-performance SaaS platform explicitly built for the real estate and mortgage industry with **Next.js 15 (Turbopack)**, **Node.js (Express)**, **FastAPI (AI Microservice)**, and **PostgreSQL (Prisma)**. Designed for speed, security, and developer experience.

## ✨ Features

- **🛡️ Secure Authentication**: Google OAuth 2.0 (Passport.js) + JWT sessions + Local Login/Signup.
- **🔐 Role-Based Access Control (RBAC)**: Dedicated logic for `Admin` and `User` dashboards.
- **🎨 Premium 2026 UI**: Built with modern Glassmorphism, Tailwind-compatible vanilla CSS, and Lucide icons.
- **🌓 Dynamic Theming**: Built-in Day/Night mode with persistent state management.
- **📊 Admin Portal**: Full-featured User Management (CRUD) with real-time database integration.
- **🤖 Mortgage AI Underwriting Engine**: Python FastAPI microservice for AI-driven mortgage analytics.
- **🏗️ Scalable Architecture**: Separate frontend and backend services for independent scaling.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS (Global Variables)
- **State**: React Context (Auth & Theme)
- **Icons**: Lucide React

### Backend
- **Engine**: Node.js & Express
- **Persistence**: PostgreSQL 16
- **ORM**: Prisma 6
- **Auth**: Passport.js & JWT

### AI / Underwriting API
- **Framework**: Python FastAPI
- **Engine**: AI-based document analysis & rules engine

## 🚀 Getting Started

### 1. Database Setup
Ensure you have PostgreSQL running. Update your connection string in `backend/.env`.
```bash
npx prisma migrate dev
```

### 2. Backend Initialization
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```

### 4. AI Microservice Initialization
```bash
cd mortgage-api
pip install -r requirements.txt
uvicorn main:app --reload
```

## 📂 Project Structure

- `/backend`: Express server, Prisma models, and Auth logic.
- `/frontend`: Next.js application with role-based routing.
- `/mortgage-api`: Python AI microservice.
- `/db`: SQL schema exports and queries.

## 🔑 License
MIT
