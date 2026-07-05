const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'college_data.json');

// Read College Data
function getCollegeData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading college data:', error);
  }
  return {};
}

// Write College Data
function saveCollegeData(data) {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing college data:', error);
    return false;
  }
}

// API: Get college data
app.get('/api/college-data', (req, res) => {
  const data = getCollegeData();
  res.json(data);
});

// API: Save college data
app.post('/api/college-data', (req, res) => {
  const success = saveCollegeData(req.body);
  if (success) {
    res.json({ success: true, message: 'Data saved successfully.' });
  } else {
    res.status(500).json({ success: false, message: 'Failed to save data.' });
  }
});

// Helper for local keyword-based chatbot fallback when API keys are missing
function localKeywordChatbot(question, data) {
  const q = question.toLowerCase();
  
  // Office guidance check
  if (q.includes('where is') || q.includes('location of') || q.includes('office') || q.includes('cell') || q.includes('room') || q.includes('building')) {
    const offices = data.offices || {};
    for (const name of Object.keys(offices)) {
      if (q.includes(name.toLowerCase()) || (name.includes('Office') && q.includes(name.replace('Office', '').trim().toLowerCase()))) {
        const o = offices[name];
        const mapPin = data.campusMap && data.campusMap.pins && data.campusMap.pins[name] ? data.campusMap.pins[name] : null;
        let answer = `The ${name} is located in the ${o.building}, Room ${o.room}. Timings: ${o.timings}. Required documents: ${o.documents || 'None'}.`;
        if (mapPin && mapPin.directions) {
          answer += ` Directions: ${mapPin.directions}`;
        }
        return answer;
      }
    }
  }

  // Fees check
  if (q.includes('fee') || q.includes('payment') || q.includes('pay') || q.includes('tuition') || q.includes('cost')) {
    const fees = data.fees || {};
    return `Fee Details:\n- Tuition: ${fees.tuition || 'N/A'}\n- Hostel: ${fees.hostel || 'N/A'}\n- Transport: ${fees.transport || 'N/A'}\n- Payment Methods: ${fees.methods || 'N/A'}\n- Due Dates: ${fees.dueDates || 'N/A'}`;
  }

  // Exams check
  if (q.includes('exam') || q.includes('schedule') || q.includes('results') || q.includes('hall ticket') || q.includes('marks')) {
    const exams = data.exams || {};
    if (q.includes('results')) return `Exam Results: ${exams.results || 'Not announced yet'}`;
    if (q.includes('hall ticket')) return `Hall Ticket info: ${exams.hallTicket || 'N/A'}`;
    return `Exam Module:\n- Schedule: ${exams.schedule || 'N/A'}\n- Guidelines: ${exams.guidelines || 'N/A'}\n- Internals: ${exams.internal || 'N/A'}`;
  }

  // Timetable check
  if (q.includes('timetable') || q.includes('schedule') || q.includes('classes') || q.includes('class')) {
    const tt = data.timetable || {};
    if (q.includes('lab')) return `Lab Schedule: ${tt.labSchedule || 'N/A'}`;
    if (q.includes("today's") || q.includes('today')) return `Today's Classes: ${tt.todayClasses || 'N/A'}`;
    return `Class Timetable: ${tt.classTimetable || 'N/A'}. Classroom Allocation: ${tt.classroomAllocation || 'N/A'}`;
  }

  // Services / Certificates check
  if (q.includes('certificate') || q.includes('bonafide') || q.includes('leave') || q.includes('id card') || q.includes('scholarship')) {
    const srv = data.services || {};
    if (q.includes('bonafide')) return `Bonafide Certificate: ${srv.bonafide || 'N/A'}`;
    if (q.includes('transfer')) return `Transfer Certificate: ${srv.transferCert || 'N/A'}`;
    if (q.includes('leave')) return `Leave Application: ${srv.leave || 'N/A'}`;
    if (q.includes('scholarship')) return `Scholarship Info: ${srv.scholarships || 'N/A'}`;
    return `Student Services:\n- ID Card: ${srv.idCard || 'N/A'}\n- Bonafide: ${srv.bonafide || 'N/A'}\n- Scholarships: ${srv.scholarships || 'N/A'}`;
  }

  // Placements check
  if (q.includes('placement') || q.includes('job') || q.includes('recruit') || q.includes('company') || q.includes('companies') || q.includes('internship')) {
    const pl = data.placement || {};
    return `Placement Cell Details:\n- Recruiters: ${pl.companies || 'N/A'}\n- Drives: ${pl.drives || 'N/A'}\n- Eligibility: ${pl.eligibility || 'N/A'}\n- Internships: ${pl.internships || 'N/A'}`;
  }

  // Facilities check
  if (q.includes('library') || q.includes('hostel') || q.includes('cafeteria') || q.includes('sports') || q.includes('labs')) {
    const fac = data.facilities || {};
    if (q.includes('library')) return `Library: ${fac.library || 'N/A'}`;
    if (q.includes('hostel')) return `Hostel Facility: ${fac.hostel || 'N/A'}`;
    if (q.includes('cafeteria')) return `Cafeteria: ${fac.cafeteria || 'N/A'}`;
    return `Facilities:\n- Library: ${fac.library || 'N/A'}\n- Hostel: ${fac.hostel || 'N/A'}\n- Cafeteria: ${fac.cafeteria || 'N/A'}\n- Transport: ${fac.transport || 'N/A'}`;
  }

  // Academic check
  if (q.includes('courses') || q.includes('departments') || q.includes('semester') || q.includes('calendar')) {
    const ac = data.academic || {};
    return `Academic Information:\n- Departments: ${ac.departments || 'N/A'}\n- Courses: ${ac.courses || 'N/A'}\n- Semester: ${ac.semester || 'N/A'}\n- Calendar: ${ac.calendar || 'N/A'}`;
  }

  // Profile check
  if (q.includes('about') || q.includes('college') || q.includes('vision') || q.includes('mission') || q.includes('contact')) {
    const prof = data.profile || {};
    return `About ${prof.name || 'College'}:\n- Vision & Mission: ${prof.vision || 'N/A'}\n- Contact: ${prof.contact || 'N/A'}\n- Location: ${prof.location || 'N/A'}`;
  }

  // Generic greeting / fallback
  return `I am Nova Helpdesk AI. (Local Keyword fallback mode: no external API key is set in .env).
To get details on a specific topic, try asking about 'fees', 'exams', 'timetable', 'placements', 'bonafide', 'library', or specific offices (e.g. 'Exam Cell', 'Academic Office').
For full AI comprehension, please configure GEMINI_API_KEY or ANTHROPIC_API_KEY in the server's .env file.`;
}

// API: Proxy Chat Request to LLM
app.post('/api/chat', async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const data = getCollegeData();
  const context = JSON.stringify({
    college: data.profile,
    academic: data.academic,
    timetable: data.timetable,
    fees: data.fees,
    exams: data.exams,
    facilities: data.facilities,
    services: data.services,
    placement: data.placement,
    notices: data.notices,
    offices: data.offices,
    campusMapDirections: data.campusMap ? data.campusMap.pins : {}
  });

  const systemInstruction = `You are the AI Helpdesk assistant for a college student portal. Answer ONLY using the JSON college data provided below — do not invent facts that aren't there. Be concise (max 4 short sentences), give clear step-by-step guidance when relevant, and when the question relates to a physical office, name the correct office, mention its building/room/timings from "offices", and include the walking directions from "campusMapDirections" if available. If the data needed isn't present in the JSON, say the admin hasn't uploaded that information yet and suggest which office to contact. College data (JSON): ${context}`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  // 1. Try Gemini API
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: question }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { maxOutputTokens: 1000 }
        })
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return res.json({ answer: text });
        }
      }
      console.warn('Gemini API call failed, status:', response.status);
    } catch (err) {
      console.error('Error calling Gemini API:', err);
    }
  }

  // 2. Try Anthropic API
  if (ANTHROPIC_API_KEY) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          system: systemInstruction,
          messages: [{ role: 'user', content: question }]
        })
      });

      if (response.ok) {
        const json = await response.json();
        const text = json.content?.find(b => b.type === 'text')?.text;
        if (text) {
          return res.json({ answer: text });
        }
      }
      console.warn('Anthropic API call failed, status:', response.status);
    } catch (err) {
      console.error('Error calling Anthropic API:', err);
    }
  }

  // 3. Fallback to local keyword matcher if no keys or API calls failed
  console.log('Using local keyword matching fallback for question:', question);
  const fallbackAnswer = localKeywordChatbot(question, data);
  res.json({ answer: fallbackAnswer });
});

// Fallback for SPA routing: serve index.html for all other GET routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Nova Helpdesk Server Running on Port ${PORT}`);
  console.log(`Open: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
