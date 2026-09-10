# ChatToTask (AS-02: ArchScale Hackathon)

> **Turn messy project conversations into structured, searchable tasks, decisions, deadlines, and approvals.**

ChatToTask parses unstructured communication logs (WhatsApp exports, Slack discussions, email chains, client meeting notes) and extracts actionable structured data with AI, persisting everything to an embedded SQLite database with instant keyword search over your project memory.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite) + Tailwind CSS + Axios |
| **Backend** | Node.js + Express |
| **Database** | SQLite via `better-sqlite3` |
| **AI Intelligence** | Google Gemini API (with offline parser fallback) |

---

## Directory Structure

```
chattotask/
├── backend/
│   ├── chattotask.db      # SQLite database file
│   ├── db.js              # Database tables initialization
│   ├── server.js          # Express API server & Gemini extraction
│   ├── package.json       # Backend dependencies
│   └── .env               # Port and GEMINI_API_KEY
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputPanel.jsx    # Paste conversation & extract
│   │   │   ├── ResultsPanel.jsx  # Summary, tasks, decisions & approvals
│   │   │   └── SearchPanel.jsx   # Search project memory
│   │   ├── App.jsx               # Main layout
│   │   ├── main.jsx              # React DOM render root
│   │   └── index.css             # Tailwind directives
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## Running ChatToTask

### 1. Configure the AI API Key
In `backend/.env`, paste your Gemini API key (obtainable from [Google AI Studio](https://aistudio.google.com/)):
```env
PORT=4000
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: If `GEMINI_API_KEY` is left blank, the app will smoothly use the built-in offline smart extractor so you can test the entire workflow immediately).*

### 2. Start the Backend API Server
```powershell
cd backend
npm start
# Server listens at http://localhost:4000
```

### 3. Start the Frontend App
In a new terminal:
```powershell
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## API Endpoints

- `POST /api/extract`: Accepts `{ text }`, performs extraction, stores to SQLite, and returns:
  ```json
  {
    "conversationId": 1,
    "summary": "...",
    "tasks": [{ "description": "...", "assignee": "...", "deadline": "..." }],
    "decisions": [{ "description": "...", "type": "decision" }],
    "approvals": [{ "description": "...", "status": "pending" }]
  }
  ```
- `GET /api/search?q=<query>`: Searches across tasks, decisions, approvals, and raw conversation text.
- `GET /api/history`: Returns all stored conversations ordered by date.

---

## Sample Test Conversation

```text
[Client - Priya]: Hi team, after reviewing samples we've decided to go with
engineered oak flooring instead of laminate for the living room. Please proceed.
[Architect - Raj]: Noted, updating the drawings. @Contractor please revise the
procurement order and confirm cost impact by Friday.
[Contractor - Suresh]: Got it, will send revised quote by Friday. Also need
approval on the extended timeline — 2 extra weeks for the oak flooring delivery.
[PM - Anita]: Approval pending from client on the 2-week extension. Will confirm
in tomorrow's call.
```
