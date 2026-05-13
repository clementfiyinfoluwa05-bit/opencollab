# OpenCollab — Developer Collaboration Board

A fullstack platform where developers post projects they're working on and find collaborators.

## Live URLs
- Frontend: https://opencollab-six.vercel.app
- Backend API: https://opencollab-opq1.onrender.com
- GitHub: https://github.com/clementfiyinfoluwa05-bit/opencollab

## Tech Stack
- Backend: Node.js, Express, PostgreSQL (Supabase)
- Frontend: React, React Router, Axios
- Auth: JWT, bcrypt, Passport.js (Google OAuth)
- Media: Multer, Cloudinary
- Deployment: Render (backend), Vercel (frontend)

## Database Schema
Three tables: users, projects, applications
- users: id, name, email, password_hash, google_id, created_at
- projects: id, user_id, name, description, stack_tags, roles_needed, commitment, is_open, screenshot_url, created_at
- applications: id, project_id, user_id, message, github_url, created_at

## API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/google | No | Google OAuth |
| GET | /api/projects | No | Get all listings |
| GET | /api/projects/:id | No | Get single listing |
| POST | /api/projects | Yes | Create listing |
| PUT | /api/projects/:id | Yes | Edit listing (owner) |
| DELETE | /api/projects/:id | Yes | Delete listing (owner) |
| PATCH | /api/projects/:id/toggle-open | Yes | Toggle open/closed |
| POST | /api/projects/:id/apply | Yes | Submit application |
| GET | /api/projects/:id/applications | Yes | View applicants (owner) |
| GET | /api/users/:id | No | Get user profile |

## Setup Instructions

### Prerequisites
- Node.js installed
- PostgreSQL database (Supabase)

### Backend Setup
```bash
cd backend
npm install
```
Create `.env` file with:
```
PORT=5000
DATABASE_URL=your_supabase_url
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```
```bash
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Run Seed File
```bash
cd backend
node seed.js
```

### Run Schema
Run `src/config/schema.sql` in your Supabase SQL editor.

## Known Limitations
- Free Render instance sleeps after 15 mins inactivity (30 second wake-up delay)
- Google OAuth callback URL must be updated for production
