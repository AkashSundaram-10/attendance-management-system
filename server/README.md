# WorkTrack Pro - Backend Server

This is the production-ready backend for the WorkTrack Pro mobile application, built with Node.js, Express, and Prisma ORM. It provides secure APIs for user authentication, worker management, attendance tracking, salary generation, advances, payments, and reporting.

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (e.g., Neon DB)
- npm or yarn

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your specific variables (especially `DATABASE_URL` pointing to your Neon PostgreSQL connection string).

3. **Database Setup**
   Push the Prisma schema to your database to create tables:
   ```bash
   npx prisma db push
   ```
   *Note: For production, you should use `npx prisma migrate deploy` after creating migrations.*

4. **Seed the Database**
   Create the default Admin user (`admin@worktrack.com` / `admin123`):
   ```bash
   npm run prisma:seed
   ```

5. **Start the Server**
   For development (auto-reloading):
   ```bash
   npm run dev
   ```
   For production:
   ```bash
   npm start
   ```

## Deployment

The backend is fully compatible with deployment platforms like **Railway** and **Render**.

### Render Deployment Steps
1. Connect your repository to Render and create a new **Web Service**.
2. **Environment**: Node.js
3. **Build Command**: `npm install && npx prisma generate && npx prisma db push`
   *(Optional: If you use migrations, run `npx prisma migrate deploy` instead of `db push`)*
4. **Start Command**: `npm start`
5. **Environment Variables**:
   Add `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`.

### Railway Deployment Steps
1. Create a new project in Railway and deploy from GitHub.
2. Railway automatically detects `package.json` and builds the Node app.
3. In Railway **Variables**, set `DATABASE_URL` and `JWT_SECRET`.
4. In Railway **Settings** -> **Build Command**, set `npm install && npx prisma generate`
5. Set **Start Command** to `npm start`.

## API Documentation Structure
All routes are prefixed with `/api`.
- `POST /api/auth/login`
- `GET/POST/PUT/DELETE /api/workers`
- `GET/POST /api/attendance`
- `GET/POST /api/salary`
- `GET/POST /api/advances`
- `GET/POST /api/payments`
- `GET /api/reports/attendance/excel`
- `GET /api/dashboard/stats`
