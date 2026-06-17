const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const FD_KEY = process.env.FD_KEY;
if (!FD_KEY) {
  console.warn('Warning: FD_KEY not set. /api/matches will return 502 until you set the Football-Data.org API key in FD_KEY');
}

const COMPETITION_ID = process.env.COMPETITION_ID || 'WC';
const POLL_INTERVAL = Number(process.env.POLL_INTERVAL_MS) || 10000; // default 10s

let lastData = null; // cached response from football-data
let clients = [];

async function fetchMatches() {
  if (!FD_KEY) return null;
  const apiUrl = `https://api.football-data.org/v4/competitions/${COMPETITION_ID}/matches?limit=500`;
  try {
    const res = await fetch(apiUrl, { headers: { 'X-Auth-Token': FD_KEY } });
    if (!res.ok) {
      console.error('Football-Data returned', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Fetch error', err);
    return null;
  }
}

// Polling loop
async function pollLoop() {
  const data = await fetchMatches();
  if (!data || !Array.isArray(data.matches)) return;

  // compare with lastData to find updates in fullTime score
  const updates = [];
  const lastMap = new Map();
  if (lastData && Array.isArray(lastData.matches)) {
    lastData.matches.forEach(m => lastMap.set(m.id, m));
  }

  data.matches.forEach(m => {
    const prev = lastMap.get(m.id);
    const prevHome = prev && prev.score && prev.score.fullTime ? prev.score.fullTime.home : null;
    const prevAway = prev && prev.score && prev.score.fullTime ? prev.score.fullTime.away : null;
    const currHome = m.score && m.score.fullTime ? m.score.fullTime.home : null;
    const currAway = m.score && m.score.fullTime ? m.score.fullTime.away : null;

    // detect newly finished (previously null, now has score) or changed score
    const prevHas = prevHome !== null && prevHome !== undefined;
    const currHas = currHome !== null && currHome !== undefined;
    if ((currHas && !prevHas) || (currHas && prevHas && (prevHome !== currHome || prevAway !== currAway))) {
      updates.push({ id: m.id, home: currHome, away: currAway, status: m.status, utcDate: m.utcDate, homeTeam: m.homeTeam, awayTeam: m.awayTeam });
    }
  });

  if (updates.length > 0) {
    // broadcast updates via SSE
    const payload = { type: 'updates', time: new Date().toISOString(), updates };
    const text = `data: ${JSON.stringify(payload)}\n\n`;
    clients.forEach(res => res.write(text));
    console.log('Broadcasted updates:', updates.length);
  }

  lastData = data;
}

// start poll loop
setInterval(pollLoop, POLL_INTERVAL);
// run once at start
pollLoop().catch(err => console.error(err));

// API endpoint: return latest matches (cached if available, otherwise fetch)
app.get('/api/matches', async (req, res) => {
  if (lastData) return res.json(lastData);
  const data = await fetchMatches();
  if (!data) return res.status(502).json({ error: 'Could not fetch from Football-Data.org (check FD_KEY)' });
  lastData = data;
  return res.json(data);
});

// SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  // send initial ping
  res.write(`data: ${JSON.stringify({ type: 'hello', time: new Date().toISOString() })}\n\n`);
  clients.push(res);
  console.log('Client connected (SSE). Total:', clients.length);

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
    console.log('Client disconnected (SSE). Total:', clients.length);
  });
});

// simple health
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server listening on ${PORT}, polling every ${POLL_INTERVAL}ms`));
