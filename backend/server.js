import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE        = path.join(__dirname, 'users.json');
const ASSIGNMENTS_FILE = path.join(__dirname, 'assignments.json');
const CLASSES_FILE     = path.join(__dirname, 'classes.json');

// instantiate OpenAI client if key is provided
const openaiKey    = process.env.OPENAI_API_KEY;
const openaiClient = openaiKey ? new OpenAI({ apiKey: openaiKey }) : null;

// instantiate Gemini client if key is provided
const geminiKey    = process.env.GEMINI_API_KEY;
const geminiClient = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));

/* ─── File helpers ─────────────────────────────────────────────── */
function readJson(file, fallback = []) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { console.error('Error reading', file, e); }
  return fallback;
}
function writeJson(file, data) {
  try { fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8'); }
  catch (e) { console.error('Error writing', file, e); }
}

const getUsers       = () => readJson(DATA_FILE);
const saveUsers      = d  => writeJson(DATA_FILE, d);
const getAssignments = () => readJson(ASSIGNMENTS_FILE);
const saveAssignments= d  => writeJson(ASSIGNMENTS_FILE, d);
const getClasses     = () => readJson(CLASSES_FILE);
const saveClasses    = d  => writeJson(CLASSES_FILE, d);

/* ─── Join-code generator ──────────────────────────────────────── */
function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous I/O/0/1
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

/* ══════════════════════════════════════════════════════════════════
   AUTH ROUTES
══════════════════════════════════════════════════════════════════ */

// Signup
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (!name || !email || !password || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' });
    if (password !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const users = getUsers();
    if (users.some(u => u.email === email))
      return res.status(400).json({ error: 'Email already registered' });

    const newUser = {
      id: Date.now().toString(),
      name, email,
      password: bcrypt.hashSync(password, 10),
      role: role || 'student',
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    saveUsers(users);

    res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, name, email, role: newUser.role } });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const users = getUsers();
    const user  = users.find(u => u.email === email);
    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });
    if (!bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/* ══════════════════════════════════════════════════════════════════
   CLASSES ROUTES
══════════════════════════════════════════════════════════════════ */

// Create a class (teacher)
app.post('/api/classes', (req, res) => {
  try {
    const { name, subject, teacherEmail, teacherName } = req.body;
    if (!name || !teacherEmail)
      return res.status(400).json({ error: 'Class name and teacher email are required' });

    const classes = getClasses();

    // Ensure join code is unique
    let joinCode;
    do { joinCode = generateJoinCode(); }
    while (classes.some(c => c.joinCode === joinCode));

    const newClass = {
      id: Date.now().toString(),
      name,
      subject: subject || 'General',
      teacherEmail,
      teacherName: teacherName || teacherEmail.split('@')[0],
      joinCode,
      studentEmails: [],
      createdAt: new Date().toISOString()
    };

    classes.push(newClass);
    saveClasses(classes);
    console.log(`[Classes] Teacher ${teacherEmail} created class "${name}" (${joinCode})`);
    res.status(201).json({ message: 'Class created', class: newClass });
  } catch (e) {
    console.error('Create class error:', e);
    res.status(500).json({ error: 'Server error creating class' });
  }
});

// Get classes (teacher sees own; student sees joined)
app.get('/api/classes', (req, res) => {
  try {
    const { email, role } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const classes = getClasses();
    const filtered = role === 'teacher'
      ? classes.filter(c => c.teacherEmail === email)
      : classes.filter(c => c.studentEmails.includes(email));

    res.json({ classes: filtered });
  } catch (e) {
    console.error('Get classes error:', e);
    res.status(500).json({ error: 'Server error fetching classes' });
  }
});

// Student joins a class by join code
app.post('/api/classes/join', (req, res) => {
  try {
    const { joinCode, studentEmail } = req.body;
    if (!joinCode || !studentEmail)
      return res.status(400).json({ error: 'Join code and student email are required' });

    const classes   = getClasses();
    const classItem = classes.find(c => c.joinCode === joinCode.toUpperCase().trim());
    if (!classItem)
      return res.status(404).json({ error: 'Class not found. Check the join code.' });
    if (classItem.studentEmails.includes(studentEmail))
      return res.status(400).json({ error: 'You have already joined this class.' });

    classItem.studentEmails.push(studentEmail);
    saveClasses(classes);
    console.log(`[Classes] Student ${studentEmail} joined "${classItem.name}" (${joinCode})`);
    res.json({ message: 'Joined class successfully', class: classItem });
  } catch (e) {
    console.error('Join class error:', e);
    res.status(500).json({ error: 'Server error joining class' });
  }
});

// Remove a student from a class (teacher)
app.delete('/api/classes/:id/students', (req, res) => {
  try {
    const { id } = req.params;
    const { teacherEmail, studentEmail } = req.body;

    const classes   = getClasses();
    const classItem = classes.find(c => c.id === id);
    if (!classItem) return res.status(404).json({ error: 'Class not found' });
    if (classItem.teacherEmail !== teacherEmail)
      return res.status(403).json({ error: 'Only the class teacher can remove students' });

    classItem.studentEmails = classItem.studentEmails.filter(e => e !== studentEmail);
    saveClasses(classes);
    res.json({ message: 'Student removed', class: classItem });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a class (teacher)
app.delete('/api/classes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { teacherEmail } = req.body;

    let classes   = getClasses();
    const classItem = classes.find(c => c.id === id);
    if (!classItem) return res.status(404).json({ error: 'Class not found' });
    if (classItem.teacherEmail !== teacherEmail)
      return res.status(403).json({ error: 'Only the teacher who created this class can delete it' });

    classes = classes.filter(c => c.id !== id);
    saveClasses(classes);
    console.log(`[Classes] Teacher ${teacherEmail} deleted class "${classItem.name}"`);
    res.json({ message: 'Class deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Server error deleting class' });
  }
});

/* ══════════════════════════════════════════════════════════════════
   ASSIGNMENT ROUTES
══════════════════════════════════════════════════════════════════ */

// Create assignment — supports classId (auto-populates emails) OR manual emails
app.post('/api/assignments', (req, res) => {
  try {
    const { title, description, dueDate, studentEmails, teacherEmail, teacherName, subject, classId, className } = req.body;

    if (!title || !teacherEmail)
      return res.status(400).json({ error: 'Title and teacher email are required' });

    let emails = [];

    if (classId) {
      // Resolve emails from the class roster
      const classes   = getClasses();
      const classItem = classes.find(c => c.id === classId);
      if (!classItem)
        return res.status(404).json({ error: 'Class not found' });
      if (classItem.teacherEmail !== teacherEmail)
        return res.status(403).json({ error: 'You are not the teacher of this class' });
      emails = classItem.studentEmails;
      if (emails.length === 0)
        return res.status(400).json({ error: 'This class has no students yet' });
    } else {
      // Manual emails
      if (!studentEmails)
        return res.status(400).json({ error: 'Student emails or a class are required' });
      emails = Array.isArray(studentEmails)
        ? studentEmails
        : studentEmails.split(',').map(e => e.trim()).filter(Boolean);
      if (emails.length === 0)
        return res.status(400).json({ error: 'At least one student email is required' });
    }

    const assignments = getAssignments();
    const newAssignment = {
      id: Date.now().toString(),
      title,
      description: description || '',
      subject: subject || 'General',
      dueDate: dueDate || null,
      teacherEmail,
      teacherName: teacherName || teacherEmail.split('@')[0],
      studentEmails: emails,
      classId: classId || null,
      className: className || null,
      completions: {},
      createdAt: new Date().toISOString()
    };

    assignments.push(newAssignment);
    saveAssignments(assignments);
    console.log(`[Assignments] Teacher ${teacherEmail} created "${title}" for ${emails.length} students${classId ? ` in class ${classId}` : ''}`);
    res.status(201).json({ message: 'Assignment created', assignment: newAssignment });
  } catch (e) {
    console.error('Assignment creation error:', e);
    res.status(500).json({ error: 'Server error creating assignment' });
  }
});

// Get assignments (by student or teacher email)
app.get('/api/assignments', (req, res) => {
  try {
    const { email, role } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const assignments = getAssignments();
    const filtered = role === 'teacher'
      ? assignments.filter(a => a.teacherEmail === email)
      : assignments.filter(a => a.studentEmails.includes(email));

    res.json({ assignments: filtered });
  } catch (e) {
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
});

// Mark assignment complete (student)
app.patch('/api/assignments/:id/complete', (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Student email is required' });

    const assignments = getAssignments();
    const assignment  = assignments.find(a => a.id === id);
    if (!assignment)  return res.status(404).json({ error: 'Assignment not found' });
    if (!assignment.studentEmails.includes(email))
      return res.status(403).json({ error: 'Not assigned to this student' });

    assignment.completions[email] = { completed: true, completedAt: new Date().toISOString() };
    saveAssignments(assignments);
    console.log(`[Assignments] Student ${email} completed "${assignment.title}"`);
    res.json({ message: 'Assignment marked complete', assignment });
  } catch (e) {
    res.status(500).json({ error: 'Server error completing assignment' });
  }
});

// Delete assignment (teacher)
app.delete('/api/assignments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    let assignments = getAssignments();
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    if (assignment.teacherEmail !== email)
      return res.status(403).json({ error: 'Only the teacher who created this can delete it' });

    assignments = assignments.filter(a => a.id !== id);
    saveAssignments(assignments);
    res.json({ message: 'Assignment deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Server error deleting assignment' });
  }
});

/* ══════════════════════════════════════════════════════════════════
   ADMIN ROUTES (Protected)
══════════════════════════════════════════════════════════════════ */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'malum2026';

const adminAuth = (req, res, next) => {
  if (req.headers['x-admin-password'] === ADMIN_PASSWORD) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized: Admin password required' });
};

// Get all users (admin view — passwords stripped)
app.get('/api/admin/users', adminAuth, (_req, res) => {
  try {
    const users = getUsers();
    const safeUsers = users.map(({ password, ...rest }) => rest);
    res.json({ users: safeUsers, total: safeUsers.length });
  } catch (e) {
    console.error('Admin users error:', e);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Get all classes (admin view)
app.get('/api/admin/classes', adminAuth, (_req, res) => {
  try {
    const classes = getClasses();
    res.json({ classes, total: classes.length });
  } catch (e) {
    console.error('Admin classes error:', e);
    res.status(500).json({ error: 'Server error fetching classes' });
  }
});

// Get all assignments (admin view)
app.get('/api/admin/assignments', adminAuth, (_req, res) => {
  try {
    const assignments = getAssignments();
    res.json({ assignments, total: assignments.length });
  } catch (e) {
    console.error('Admin assignments error:', e);
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
});

/* ══════════════════════════════════════════════════════════════════
   AI / STUDY ROUTES (unchanged)
══════════════════════════════════════════════════════════════════ */

app.get('/api/health', (_req, res) => res.json({ status: 'Backend is running' }));

app.post('/api/study', async (req, res) => {
  try {
    const { prompt, options, fileData } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    if (geminiKey && geminiClient) {
      console.log('[Study API] Calling Gemini via official SDK');
      try {
        const modelId = (options && options.model) || 'gemini-1.5-flash';
        const model = geminiClient.getGenerativeModel({ model: modelId });
        let contents;
        if (fileData && fileData.base64 && fileData.mimeType) {
          contents = [prompt, { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } }];
        } else {
          contents = prompt;
        }
        const result = await model.generateContent(contents);
        const response = await result.response;
        return res.json({ result: response.text(), raw: response });
      } catch (err) {
        console.error('[Study API] Gemini SDK error', err);
        if (err.message && err.message.includes('API key not valid')) {
          return res.json({
            result: `**Mock AI Response**\n\nThe AI powered feature is working correctly! However, your API key is invalid.\n\nYour prompt: "${prompt}"`,
            raw: { fallback: true }
          });
        }
        return res.status(500).json({ error: err.message || 'Gemini client error' });
      }
    }

    if (openaiKey && openaiClient) {
      try {
        const model    = (options && options.model) || 'gpt-4o-mini';
        const response = await openaiClient.responses.create({ model, input: prompt });
        const resultText = response.output_text || '';
        return res.json({ result: resultText, raw: response });
      } catch (err) {
        return res.status(500).json({ error: err.message || 'OpenAI client error' });
      }
    }

    return res.json({
      result: 'This is a development fallback response. Set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env.',
      raw: { info: 'dev-fallback' }
    });
  } catch (err) {
    console.error('Study API error:', err && (err.stack || err.message || err));
    return res.status(500).json({ error: 'Server error in /api/study' });
  }
});

app.post('/api/audio-overview', async (req, res) => {
  try {
    const { prompt, fileData, tone = 'engaging', detail = 'standard' } = req.body || {};
    if (!geminiKey || !geminiClient)
      return res.status(500).json({ error: 'Gemini API key is required' });

    const systemPrompt = `You are a world-class podcast producer like the creators of "Radiolab" or "The Daily."
Your goal is to transform the provided source material into a gripping, highly conversational, and incredibly HUMAN audio overview. 

CRITICAL: The audience hates robotic, formal educational content. They want a conversation between two friends who are genuinely excited about the topic.

HOST PERSONAS:
1. **Alex (Host 1 - The Curious Explorer)**: Energetic, asks the "dumb" questions, reacts with "Wow" and "Wait, back up," finishes Sam's thoughts when excited.
2. **Sam (Host 2 - The Insightful Expert)**: Calm, brilliant at analogies, loves the "Aha!" moments, uses "Think of it like this..."

CONVERSATIONAL DYNAMICS (Mandatory):
- **Verbal Fillers**: Use "um," "uh," "like," "I mean," "you know," "honestly," "right?"
- **Emotional Cues**: Include reactions like "(laughs)", "Ooh, that's good!", "Seriously?", "Wait, what?".
- **Natural Flow**: Alex should occasionally interrupt or jump in. Use dashes "--" for sudden pivots and "..." for trailing off or pauses.
- **Micro-Dialogue**: Short back-and-forth segments like "Sam: Exactly. Alex: Wow. Sam: I know, right?"
- **Detail Level**: ${detail}.
- **DURATION TARGET**: ${detail === 'extra' ? '30 MINUTES (EXTREME DETAIL)' : '5 MINUTES (PUNCHY)'}.
- **INSTRUCTION FOR 30-MIN MODE**: If duration is "30 MINUTES", you MUST generate a massive script (at least 150-200 lines of dialogue). Do not gloss over anything. Deep-dive into every sub-topic, historical context, and technical detail. Make the conversation expansive and leisurely.

STRUCTURE:
1. **The Hook**: A startling fact or personal anecdote related to the topic.
2. **The Connection**: Why should the listener care right now?
3. **The Core**: Explain the mechanics using analogies, not jargon.
4. **The Wrap**: A punchy, memorable final thought.

QUIZ:
Generate 4 challenging questions that test deep understanding, not just recall.

Return ONLY raw parseable JSON:
{
  "podcast": [{ "host": "1", "name": "Alex", "text": "..." }],
  "quiz": [{ "question": "...", "options": ["A","B","C","D"], "correctAnswerIndex": 0, "explanation": "..." }]
}`;

    let contents;
    const durationLabel = detail === 'extra' ? 'a deep-dive 20-30 minute' : 'a punchy 5-minute';
    const userPrompt = prompt 
      ? `Generate ${durationLabel} podcast script about: ${prompt}` 
      : `Analyze the attached material and create ${durationLabel} podcast conversation. EXHAUST EVERY DETAIL if this is a deep-dive.`;
    
    if (fileData && fileData.base64 && fileData.mimeType) {
      contents = [systemPrompt, userPrompt, { inlineData: { data: fileData.base64, mimeType: fileData.mimeType } }];
    } else {
      contents = [systemPrompt, userPrompt];
    }

    const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(contents);
    const response = await result.response;
    const text = response.text();
    let rawText = text.replace(/^```json\n?/m, '').replace(/^```\n?/m, '').replace(/```$/m, '');
    
    const resultJson = JSON.parse(rawText.trim());
    
    // Assign OpenAI voices if key exists
    if (openaiKey && resultJson.podcast) {
      resultJson.podcast = resultJson.podcast.map(line => ({
        ...line,
        voice: line.host === '1' ? 'shimmer' : 'onyx' // Professional OpenAI voices
      }));
    }
    
    return res.json({ result: resultJson });
  } catch (err) {
    console.error('[Audio Overview API] error:', err);
    return res.status(500).json({ error: err.message || 'Error generating overview.' });
  }
});

app.post('/api/tts', async (req, res) => {
  try {
    const { text, voice = 'shimmer' } = req.body;
    if (!openaiKey || !openaiClient) {
      return res.status(500).json({ error: 'OpenAI API key is required for high-quality TTS' });
    }

    console.log(`[TTS] Generating audio for: "${text.slice(0, 30)}..."`);
    const mp3 = await openaiClient.audio.speech.create({
      model: "tts-1",
      voice: voice, // alloy, echo, fabled, onyx, nova, shimmer
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length
    });
    res.send(buffer);
  } catch (err) {
    console.error('[TTS Error]', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/mock-notebook', express.json(), (req, res) => {
  const { prompt } = req.body || {};
  const preview = (typeof prompt === 'string') ? prompt.slice(0, 300) : '';
  return res.json({ result: `Mock response for: ${preview}`, raw: { mock: true } });
});

/* ══════════════════════════════════════════════════════════════════
   START
══════════════════════════════════════════════════════════════════ */
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${__dirname}`);
});
