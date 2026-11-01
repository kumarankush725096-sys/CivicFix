import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// In-memory reports store seeded with realistic initial civic records
const reportsDatabase = [
  {
    id: 4091,
    title: 'Severe water main burst & road cave-in',
    location: 'Sector 4, Main Transit Junction',
    description: 'Underground pressurized pipe rupture causing 2-foot road erosion and potable water waste.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'Dispatched',
    analysis: {
      category: 'Water Supply & Drainage',
      priority: 'High',
      assignedDepartment: 'Municipal Water Board (Jal Board) & PWD',
      summary: 'High-pressure pipe rupture with ongoing roadway structural compromise.',
      recommendedAction: 'Emergency valve isolation within 2 hours; dispatch trench repair crew.',
      applicablePolicy: 'National Water Policy & Urban Utility Charter (Sec 14: Potable Loss Prevention)',
      slaHours: 24,
      credibilityScore: 98,
      isAuthenticHazard: true
    }
  },
  {
    id: 4088,
    title: 'Hazardous chemical runoff near secondary school canal',
    location: 'Industrial Zone Border, North Canal Road',
    description: 'Dark untreated effluent discharging into stormwater drain near residential perimeter.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'In Review',
    analysis: {
      category: 'Public Safety & Environmental Pollution',
      priority: 'High',
      assignedDepartment: 'State Pollution Control Board (SPCB)',
      summary: 'Suspected illicit toxic trade effluent breach into municipal storm system.',
      recommendedAction: 'Issue immediate containment order; draw forensic water samples.',
      applicablePolicy: 'Water (Prevention and Control of Pollution) Act, Sec 24/25',
      slaHours: 12,
      credibilityScore: 94,
      isAuthenticHazard: true
    }
  }
];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CivicFix Governance Engine Operational' });
});

app.get('/api/reports', (req, res) => {
  res.json({ success: true, count: reportsDatabase.length, reports: reportsDatabase });
});

app.post('/api/report', upload.single('image'), async (req, res) => {
  try {
    const { title, description, location } = req.body;
    const file = req.file;

    const promptText = `
You are an expert AI civic triage and regulatory governance officer for a municipal corporation.
Analyze the following citizen grievance report${file ? ' and photographic evidence' : ''}:

Title: ${title || 'N/A'}
Description: ${description || 'N/A'}
Location: ${location || 'N/A'}

Evaluate the severity carefully using these STRICT priority thresholds:
- "High": ONLY for immediate, active threats to human life, structural collapse risks, live exposed electric wires, major gas/toxic chemical leaks, or active severe flooding blocking arterial roads.
- "Medium": For significant disruptions that do not pose immediate mortal danger, such as non-arterial road potholes, standard water line leakages, uncollected garbage accumulating for days, or non-functional traffic signals.
- "Low": For routine civic maintenance, aesthetic issues, single non-working streetlights on quiet streets, faded lane markings, mild litter, overgrown roadside grass, or minor cosmetic damage.

Provide your rigorous assessment strictly in valid JSON format with these exact keys:
{
  "category": "Road Infrastructure, Sanitation & Waste, Water Supply & Drainage, Electricity & Streetlighting, Public Safety & Environmental Pollution, or Other",
  "priority": "High, Medium, or Low",
  "assignedDepartment": "The precise governmental authority or municipal wing",
  "summary": "A concise 1-sentence technical briefing of the civic issue.",
  "recommendedAction": "Precise procedural action for field responders.",
  "applicablePolicy": "Relevant civic bylaw, Public Grievance Charter standard, or environmental regulation section",
  "slaHours": 72,
  "credibilityScore": 95,
  "isAuthenticHazard": true
}

Note for "slaHours":
- If High priority: assign 12 to 24 hours.
- If Medium priority: assign 48 to 72 hours.
- If Low priority: assign 96 to 168 hours.

Do not include markdown ticks, explanation, or text outside the raw JSON.
`;

    const contents = [{ text: promptText }];

    if (file) {
      contents.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString('base64'),
        },
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const aiAnalysis = JSON.parse(response.text);

    let imageUrl = null;
    if (file) {
      imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    const fullReport = {
      id: Math.floor(1000 + Math.random() * 9000),
      title: title || 'Untitled Issue',
      description: description || 'No description provided',
      location: location || 'Location unspecified',
      imageUrl: imageUrl,
      createdAt: new Date().toISOString(),
      status: 'In Review',
      analysis: aiAnalysis,
    };

    reportsDatabase.unshift(fullReport);

    res.status(200).json({ success: true, report: fullReport });
  } catch (error) {
    console.error('Civic report processing failure:', error);
    res.status(500).json({ success: false, error: error.message || 'Server error' });
  }
});

app.patch('/api/reports/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const item = reportsDatabase.find((r) => r.id === parseInt(id));
  if (item) {
    item.status = status;
    return res.json({ success: true, report: item });
  }
  res.status(404).json({ success: false, message: 'Report not found' });
});

app.listen(PORT, () => {
  console.log(`CivicFix backend running on http://localhost:${PORT}`);
});