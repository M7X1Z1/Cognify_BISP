# Cognify — AI-Powered Study Assistant

> Transform your study materials into summaries, quizzes, and flashcards using AI.

**Live app:** https://cognify-bisp.up.railway.app *(available after Railway deployment)*
**Repository:** https://github.com/M7X1Z1/Cognify_BISP

---

## Description

Cognify is a full-stack web application that helps students and learners study more effectively. Users paste text or upload a file and receive AI-generated outputs tailored to their chosen mode and difficulty level. Sessions are saved for later review, and users can manage their learning history through a clean, responsive interface.

---

## Features

- **AI-Powered Modes** — Generate bullet-point summaries, interactive multiple-choice quizzes, or flip-card flashcards from any text
- **File Upload** — Supports `.txt`, `.pdf`, `.docx`, and `.pptx` files (up to 20 MB)
- **Difficulty Levels** — Easy, Medium, and Hard modes adjust AI output complexity
- **Custom Instructions** — Provide additional guidance to shape the AI response
- **Interactive Quiz** — Click to select answers; correct/wrong feedback revealed per question
- **Interactive Flashcards** — Click a card to flip and reveal the answer (3D animation)
- **Formatted Summaries** — Rendered as styled markdown (headings, lists, bold text)
- **Session History** — View and delete past study sessions
- **Output Actions** — Copy to clipboard or download output as `.txt`
- **Authentication** — JWT-based register/login with bcrypt password hashing
- **Security** — Helmet headers, CORS, rate limiting (20 requests / 15 min per user), input sanitization

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios, Vite, `marked`, `dompurify` |
| Backend | Node.js, Express 4, Mongoose 8, Multer, Helmet, `express-rate-limit` |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| AI | Google Gemini API (`gemini-2.5-flash-lite`) via `@google/generative-ai` |
| Deployment | Railway (single-service — Express serves the API + React build) |

---

## Local Development

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account (free tier works)
- A [Google Gemini API key](https://aistudio.google.com) (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/M7X1Z1/Cognify_BISP.git
cd Cognify_BISP
```

### 2. Install dependencies

```bash
# From the project root — installs both backend and frontend
npm run install:all
```

Or manually:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Create `backend/.env` using the template below (see [Environment Variables](#environment-variables)).

### 4. Run in development

```bash
# From the project root — starts both servers concurrently
npm run dev
```

Or separately:

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Usage

1. Register or log in.
2. Paste text or upload a file (`.txt`, `.pdf`, `.docx`, `.pptx`).
3. Select a mode: **Summary**, **Quiz**, or **Flashcards**.
4. Choose a difficulty level and optionally add custom instructions.
5. Click **Generate** and interact with the AI output.
6. Copy, download, or revisit sessions from **History**.

---

## Project Structure

```
Cognify_BISP/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB Atlas connection
│   ├── constants/
│   │   └── mimeTypes.js           # Allowed MIME types (shared)
│   ├── controllers/
│   │   ├── authController.js      # Register / login logic
│   │   └── studyController.js     # File extraction + AI generation
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── models/
│   │   ├── StudySession.js        # Study session schema
│   │   └── User.js                # User schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── studyRoutes.js         # /api/study/* (rate limiter + multer)
│   ├── services/
│   │   └── aiService.js           # Gemini API calls + JSON extraction
│   ├── .env                       # Environment variables (not committed)
│   ├── .env.example               # Template for required variables
│   └── server.js                  # Express entry point
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js          # Axios instance (falls back to /api)
│   │   ├── components/
│   │   │   ├── AuthCard.jsx       # Shared login/register card shell
│   │   │   ├── FlashcardsOutput.jsx  # Flip-card renderer
│   │   │   ├── GuestRoute.jsx     # Redirects authenticated users
│   │   │   ├── Navbar.jsx         # Top navigation
│   │   │   ├── OutputPanel.jsx    # Output renderer (summary/quiz/flashcards)
│   │   │   ├── ProtectedRoute.jsx # Redirects unauthenticated users
│   │   │   ├── QuizOutput.jsx     # Interactive quiz renderer
│   │   │   ├── SessionCard.jsx    # History list item
│   │   │   └── StudyForm.jsx      # Main input form
│   │   ├── constants/
│   │   │   └── modes.js           # MODES array + MODE_MAP (summary/quiz/flashcards)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx      # Main study page
│   │   │   ├── History.jsx        # Past sessions page
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── App.jsx                # Routes
│   │   ├── index.css              # Design system + component styles
│   │   └── main.jsx               # React entry point
│   ├── index.html
│   └── vite.config.js
├── package.json                   # Root scripts (dev, build, install:all)
├── railway.toml                   # Railway deployment config
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | No | Register a new user |
| `POST` | `/api/auth/login` | No | Login and receive a JWT |
| `POST` | `/api/study/generate` | Yes | Generate AI output from text or file |
| `GET` | `/api/study/history` | Yes | Retrieve the user's past sessions |
| `DELETE` | `/api/study/:id` | Yes | Delete a session by ID |
| `GET` | `/api/health` | No | Server health check |

> Rate limit on `/api/study/generate`: **20 requests per 15 minutes** per authenticated user.

---

## Environment Variables

Create `backend/.env` with the following keys. A template is provided in `backend/.env.example`.

```env
# Server port (Railway sets this automatically — only needed locally)
PORT=5000

# MongoDB Atlas — use the direct connection string (not mongodb+srv://)
# Get it from: Atlas > Database > Connect > Drivers > copy the connection string
MONGO_URI=mongodb://<user>:<password>@<shard-00-00>.<cluster>.mongodb.net:27017,<shard-00-01>.<cluster>.mongodb.net:27017,<shard-00-02>.<cluster>.mongodb.net:27017/<dbname>?ssl=true&replicaSet=<replicaSet>&authSource=admin&appName=Cluster0

# Any long random string — min 32 characters recommended
JWT_SECRET=your_long_random_secret_here

# From https://aistudio.google.com — free tier available
GEMINI_API_KEY=your_gemini_api_key_here

# Local dev: your Vite dev server URL
# Production (Railway): your Railway public domain, e.g. https://cognify-bisp.up.railway.app
CLIENT_URL=http://localhost:5173
```

> **MongoDB note:** Use the **direct connection string**, not the `mongodb+srv://` SRV format.
> SRV lookups can fail on restricted networks.

---

## Deployment on Railway

The app is configured for a **single Railway service**: Express builds and serves both the API and the React frontend.

### Steps

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) and create a **New Project > Deploy from GitHub repo**.
3. Select this repository.
4. In the service **Variables** tab, add these environment variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGO_URI` | Your MongoDB Atlas direct connection string |
| `JWT_SECRET` | Your secret key |
| `GEMINI_API_KEY` | Your Gemini API key |
| `CLIENT_URL` | Your Railway public domain (e.g. `https://cognify-bisp.up.railway.app`) |

> **Note:** `PORT` is set automatically by Railway — do not override it.
> `VITE_API_URL` is not needed — Axios falls back to relative `/api` paths when both are on the same domain.

5. Railway will automatically run:
   - **Build:** `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
   - **Start:** `node backend/server.js`

6. Once deployed, copy the Railway-generated domain and update `CLIENT_URL` to match.

---

## Future Improvements

| # | Feature |
|---|---------|
| 1 | Settings & Profile (display name, avatar, password change) |
| 2 | Search & Filter (tag sessions, filter by mode/date) |
| 3 | Dashboard Metrics (session count, streaks, mode breakdown) |
| 4 | Quiz Score Tracking (per-attempt results and history) |
| 5 | Spaced Repetition (SM-2 algorithm for flashcard scheduling) |
| 6 | Export (PDF/CSV via `pdfkit` / `json2csv`) |
| 7 | Notifications (in-app toasts + email via `nodemailer`) |
| 8 | Study Path Generator (AI multi-session study plans) |

---

## License

This project is licensed under the [MIT License](LICENSE).
