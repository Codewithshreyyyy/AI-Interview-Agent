# 🤖 AI Interview Agent

An AI-powered technical interview platform that conducts personalized interviews, generates questions dynamically, evaluates candidate responses, and provides a structured performance report.

## 🌐 Live Demo

**Frontend:** `YOUR_VERCEL_URL`

**Backend API:** `YOUR_RENDER_URL`

> Replace these placeholders with your actual deployed URLs before committing.

## 📌 Overview

AI Interview Agent simulates a technical interview using Generative AI. Candidates can select their profile, configure an interview, receive AI-generated questions, submit answers, and receive an AI-powered performance report.

## ✨ Features

- Candidate ID-based identification
- Candidate information loading
- Interview personalization
- AI-generated technical questions
- Dynamic interview flow
- Candidate answer submission
- AI-powered answer evaluation
- Technical knowledge scoring
- Problem-solving scoring
- Communication scoring
- Confidence and accuracy scoring
- Question-wise review
- Strengths and weaknesses
- Improvement suggestions
- Final interview result dashboard

## 🏗️ Architecture

```text
Candidate
    ↓
Frontend (HTML/CSS/JS) — Vercel
    ↓ REST API
Node.js + Express Backend — Render
    ↓
Google Gemini API
    ↓
AI Questions + Evaluation
    ↓
Interview Results
```

## 🛠️ Technology Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- Responsive UI
- Lucide Icons

### Backend
- Node.js
- Express.js
- REST APIs
- Axios

### AI
- Google Gemini API
- `@google/genai`

### Data
- JSON-based candidate data
- Interview session data
- Browser Local Storage for frontend session information

### Deployment
- GitHub
- Vercel — Frontend
- Render — Backend

## 📁 Project Structure

```text
AI-Interview-Agent/
├── FRONTEND/
├── backend/
│   ├── controllers/
│   ├── data/
│   ├── routes/
│   ├── services/
│   ├── sessions/
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
├── .gitignore
├── README.md
└── PROMPTS.md
```

## 🔄 Interview Workflow

```text
Candidate Identification
        ↓
Interview Personalization
        ↓
Session Creation
        ↓
AI Question Generation
        ↓
Candidate Answer
        ↓
AI Answer Evaluation
        ↓
Next Question
        ↓
Final Evaluation
        ↓
Result Dashboard
```

## 🤖 AI Workflow

### Question Generation

```text
Interview Context
      ↓
Backend Prompt
      ↓
Gemini API
      ↓
Generated Question
```

### Answer Evaluation

```text
Candidate Answer
      ↓
Evaluation Prompt
      ↓
Gemini API
      ↓
Structured Evaluation
      ↓
Score + Feedback
```

## 🔐 Environment Variables

Create `backend/.env` locally:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Never commit `.env` or API keys to GitHub.

For production, configure `GEMINI_API_KEY` through the backend hosting platform's environment variables.

## 💻 Local Development

### Clone

```bash
git clone https://github.com/YOUR_USERNAME/AI-Interview-Agent.git
cd AI-Interview-Agent
```

### Install backend dependencies

```bash
cd backend
npm install
```

### Configure environment

Create `backend/.env`:

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Start backend

```bash
node server.js
```

Local backend:

```text
http://localhost:5001
```

Run the frontend using a local development server such as VS Code Live Server.

## 🌍 Production Deployment

### Frontend — Vercel

The frontend is deployed through Vercel from the GitHub repository.

### Backend — Render

The Node.js/Express backend is deployed through Render. The Gemini API key is configured as a Render environment variable.

The frontend communicates with the production backend through REST API requests.

## 🔒 Security

- Gemini API key is stored in environment variables.
- `.env` files are excluded from Git.
- API credentials are not included in frontend JavaScript.
- Production secrets are configured through hosting-platform environment variables.
- `node_modules` is excluded from Git.

## 🧪 Testing

The complete workflow was tested:

```text
Candidate Selection
      ↓
Interview Configuration
      ↓
Question Generation
      ↓
Answer Submission
      ↓
Next Question
      ↓
AI Evaluation
      ↓
Final Result
```

## 📚 Learning Outcomes

- Frontend/backend integration
- REST API development
- Node.js and Express.js
- Gemini API integration
- Prompt engineering
- Structured AI evaluation
- JSON data handling
- Session management
- Environment variables
- API security
- Git and GitHub
- Vercel deployment
- Render deployment
- Production debugging

## 🚀 Future Improvements

- Persistent database integration
- Authentication and authorization
- Candidate history
- Interview analytics
- Resume-based question generation
- Voice-based interviews
- Speech-to-text answers
- Adaptive questioning
- Admin dashboard
- Interview comparison and analytics

## 📄 AI Usage

The AI-assisted development process is documented in `PROMPTS.md`.
