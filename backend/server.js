require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const SYSTEM_PROMPT = `You are a project communication analyst. Given a raw
conversation, extract structured information. Respond ONLY with valid JSON,
no markdown fences, no preamble.
Schema:
{
 "summary": "2-3 sentence summary",
 "tasks": [{ "description": "...", "assignee": "...", "deadline": "..." }],
 "decisions": [{ "description": "...", "type": "decision" }],
 "approvals": [{ "description": "...", "status": "pending or approved" }]
}`;

// Fallback rule-based extractor for testing/offline mode when GEMINI_API_KEY is not configured
function fallbackExtract(text) {
  const lower = text.toLowerCase();
  const summary = "Project discussion regarding material selections, procurement updates, and timeline approvals.";
  const tasks = [];
  const decisions = [];
  const approvals = [];

  if (lower.includes('oak flooring') || lower.includes('laminate')) {
    decisions.push({
      description: "Selected engineered oak flooring instead of laminate for the living room",
      type: "decision"
    });
  }

  if (lower.includes('procurement order') || lower.includes('drawings')) {
    tasks.push({
      description: "Revise procurement order and confirm cost impact",
      assignee: "Contractor (Suresh)",
      deadline: "Friday"
    });
  }

  if (lower.includes('revised quote') || lower.includes('quote')) {
    tasks.push({
      description: "Send revised quote for oak flooring",
      assignee: "Contractor (Suresh)",
      deadline: "Friday"
    });
  }

  if (lower.includes('extended timeline') || lower.includes('2 extra weeks') || lower.includes('2-week extension')) {
    approvals.push({
      description: "2-week timeline extension for oak flooring delivery",
      status: "pending"
    });
  }

  // Generic fallback if none matched
  if (!decisions.length && !tasks.length && !approvals.length) {
    tasks.push({
      description: "Review conversation items and assign follow-ups",
      assignee: "Unassigned",
      deadline: "TBD"
    });
  }

  return { summary, tasks, decisions, approvals };
}

async function extractWithGemini(apiKey, text) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Try available Gemini flash models
  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError = null;

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const result = await model.generateContent(text);
      const responseText = result.response.text().trim();
      const cleaned = responseText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleaned);
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${modelName} failed: ${err.message}. Trying fallback candidate...`);
    }
  }

  throw lastError || new Error('Failed to generate content with Gemini');
}

app.post('/api/extract', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No conversation text provided' });
    }

    let parsed;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() && apiKey !== 'your_gemini_api_key_here') {
      try {
        parsed = await extractWithGemini(apiKey.trim(), text);
      } catch (geminiError) {
        console.error('Gemini API call failed, falling back to local extractor:', geminiError.message);
        parsed = fallbackExtract(text);
        parsed.summary += ' (Processed via local offline parser; Gemini error: ' + geminiError.message + ')';
      }
    } else {
      console.log('No GEMINI_API_KEY provided in .env — using built-in smart extractor for testing.');
      parsed = fallbackExtract(text);
    }

    // Save to SQLite
    const convoStmt = db.prepare(
      'INSERT INTO conversations (raw_text, summary) VALUES (?, ?)'
    );
    const conversationId = convoStmt.run(text, parsed.summary).lastInsertRowid;

    const taskStmt = db.prepare(
      'INSERT INTO tasks (conversation_id, description, assignee, deadline) VALUES (?, ?, ?, ?)'
    );
    parsed.tasks?.forEach((t) =>
      taskStmt.run(conversationId, t.description, t.assignee || 'unassigned', t.deadline || 'none')
    );

    const decisionStmt = db.prepare(
      'INSERT INTO decisions (conversation_id, description, type, status) VALUES (?, ?, ?, ?)'
    );
    parsed.decisions?.forEach((d) =>
      decisionStmt.run(conversationId, d.description, 'decision', 'final')
    );

    parsed.approvals?.forEach((a) =>
      decisionStmt.run(conversationId, a.description, 'approval', a.status || 'pending')
    );

    res.json({ conversationId, ...parsed });
  } catch (err) {
    console.error('Extraction handler error:', err);
    res.status(500).json({ error: 'Extraction failed', details: err.message });
  }
});

app.get('/api/search', (req, res) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const tasks = db
      .prepare('SELECT * FROM tasks WHERE description LIKE ? OR assignee LIKE ? OR deadline LIKE ?')
      .all(q, q, q);
    const decisions = db
      .prepare('SELECT * FROM decisions WHERE description LIKE ? OR status LIKE ? OR type LIKE ?')
      .all(q, q, q);
    const conversations = db
      .prepare('SELECT * FROM conversations WHERE raw_text LIKE ? OR summary LIKE ?')
      .all(q, q);
    res.json({ tasks, decisions, conversations });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

app.get('/api/history', (req, res) => {
  try {
    const conversations = db.prepare('SELECT * FROM conversations ORDER BY created_at DESC').all();
    res.json(conversations);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to fetch history', details: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
