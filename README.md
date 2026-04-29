# Persona-Based AI Chatbot

A full-stack chatbot that lets users talk to three distinct personas using the HuggingFace Inference Router (OpenAI-compatible).

## Features
- Persona switcher with conversation reset
- Clean chat UI with suggestion chips and typing indicator
- Mobile-friendly responsive layout
- Backend routes with persona-specific system prompts

## Project Structure
```
Persona-Based_AI_Chatbot/
  backend/
    server.js
    prompts/
      kshitij.js
      anshuman.js
      abhimanyu.js
  frontend/
    src/
      components/
      data/
```

## Backend Setup
1. Create env file:
   - Copy backend/.env.example to backend/.env
   - Add your API key.

2. Install dependencies and run:
```bash
cd backend
npm install
npm run dev
```

Backend runs on http://localhost:5000

## Frontend Setup
1. Create env file:
   - Copy frontend/.env.example to frontend/.env
   - Update VITE_API_URL if needed.

2. Install dependencies and run:
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

## Tests
Backend tests:
```bash
cd backend
npm test
```

Frontend tests:
```bash
cd frontend
npm test
```

## Deployment
- Backend: Render or Railway
  - Set HF_API_KEY and PORT environment variables.
  - Ensure root prompt files are included in the deploy bundle.
- Frontend: Vercel
  - Set VITE_API_URL to your backend URL.

## System Prompts
System prompts are stored at the project root:
- Kshitij_Mishra's_persona.txt
- Anshuman_Singh's_persona.txt
- Abhimanyu_Saxena's_persona.txt

These are loaded by backend prompt modules at runtime.

## Docs
- prompts.md: all persona prompts with annotations
- reflection.md: 300-500 word reflection on prompt engineering
