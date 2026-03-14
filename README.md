# Hair Bounty Care API

Backend API for the Hair Bounty Care mobile application.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for production)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL

Create a PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE hairbounty;
CREATE USER hairbounty WITH PASSWORD 'hairbounty';
GRANT ALL PRIVILEGES ON DATABASE hairbounty TO hairbounty;
```

Or use Docker:

```bash
docker run --name hairbounty-postgres -e POSTGRES_USER=hairbounty -e POSTGRES_PASSWORD=hairbounty -e POSTGRES_DB=hairbounty -p 5432:5432 -d postgres:14
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Update DATABASE_URL and JWT secrets in `.env`:

```
DATABASE_URL="postgresql://hairbounty:hairbounty@localhost:5432/hairbounty?schema=public"
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-minimum-32-characters-long
```

### 4. Run Migrations

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password
- `POST /auth/verify-email` - Verify email address
- `GET /auth/me` - Get current user (protected)

### Health Check

```
GET /api/v1/health
```

## Project Structure

```
src/
├── config/          # Configuration files (env, database)
├── middleware/      # Express middleware (auth, validation, rate limiting)
├── routes/          # API routes
├── controllers/     # Request handlers
├── services/        # Business logic
├── validations/     # Zod schemas for validation
├── types/           # TypeScript types
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Zod** - Validation
- **bcrypt** - Password hashing
- **Nodemailer** - Email sending

## License

MIT
