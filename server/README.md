# Backend (server)

This folder contains the Express backend for the BreakthroughAI project.

Key features:

- MongoDB via `MONGODB_URI` (Atlas)
- Fallback JSON store at `server/data/fallback.json` when MongoDB isn't available
- Structured logging via `lib/logger.js`
- Graceful startup and shutdown

Running locally (no Docker)

1. Install dependencies and run in development mode:

```bash
cd server
npm install
# start the server (reads .env for PORT and MONGODB_URI)
npm run dev
```

2. Fallback store (when MongoDB is unavailable)

If `MONGODB_URI` is not reachable (e.g. Atlas IP not whitelisted), the server will automatically use `server/data/fallback.json`. Use `scripts/seed-fallback.js` to populate sample data:

```bash
node scripts/seed-fallback.js
```

3. Quick smoke test (fallback mode):

```bash
# health
curl http://localhost:8081/api/health
# list appointments
curl http://localhost:8081/api/appointments
```

Notes:

- API routes for appointments support create/list/get/update/cancel; JWT auth is required for create/update/cancel endpoints (use `JWT_SECRET` in `.env` for signing tokens).
- For production deployment, provide a reachable `MONGODB_URI` and a secure `JWT_SECRET` in `server/.env`.

# Swasth AI MongoDB Backend

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure MongoDB

1. Create MongoDB Atlas account at https://cloud.mongodb.com
2. Create a new cluster
3. Get your connection string
4. Update `.env` file with your credentials:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.mongodb.net/swasth-ai?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
```

### 3. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 4. Test the API

Visit: http://localhost:5000/api/health

## API Endpoints

### Authentication

- `POST /api/auth/google-login` - Google OAuth login
- `POST /api/auth/login` - Email/password login

### Patients

- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/search/:query` - Search patients

### Health Check

- `GET /api/health` - Server and database status

## Frontend Integration

The frontend automatically detects if MongoDB is available and falls back to local storage if not connected.

## Security Features

- CORS protection
- Rate limiting
- Helmet security headers
- JWT authentication
- Input validation
- Error handling

## Production Deployment

1. Set `NODE_ENV=production`
2. Update CORS origin to your domain
3. Use strong JWT secret
4. Enable MongoDB Atlas IP whitelist
5. Deploy to Heroku/Vercel/AWS
