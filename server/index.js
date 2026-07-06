import express from 'express';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

const app = express();
const PORT = process.env.PORT || 3001;

const sheets = google.sheets('v4');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const spreadsheetId = '1W44B9PQAAmzPbFxB6YPy3FSqs0is9ppzOuG474GFfRE';

let authClient = null;

async function getAuthClient() {
  if (authClient) return authClient;
  
  const credentialsPath = join(__dirname, '../credentials.json');
  console.log('[Server] Loading credentials from:', credentialsPath);
  
  const credentials = JSON.parse(
    require('fs').readFileSync(credentialsPath, 'utf8')
  );
  
  console.log('[Server] Credentials loaded, service account:', credentials.client_email);
  
  authClient = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
  });
  
  return authClient;
}

const SHEET_RANGES = {
  'Игры': 'Игры!A:Z',
  'Игроки': 'Игроки!A:Z',
  'Предметы': 'Предметы!A:Z',
  'Категории': 'Категории!A:Z',
  'Спецколеса': 'Спецколеса!A:Z',
  'Ивенты': 'Ивенты!A:Z',
  'Правила': 'Правила!A:Z',
};

async function fetchSheetFromGoogle(sheetName) {
  const range = SHEET_RANGES[sheetName];
  if (!range) {
    throw new Error(`Unknown sheet: ${sheetName}`);
  }

  console.log(`[Server] Fetching range: ${range}`);
  
  const auth = await getAuthClient();
  
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
    auth,
  });

  const rows = response.data.values || [];
  const cols = rows.length > 0 ? rows[0] : [];
  const dataRows = rows.slice(1);
  
  console.log(`[Server] ${sheetName}: ${dataRows.length} rows, ${cols.length} columns`);
  console.log(`[Server] Columns: ${cols.join(', ')}`);
  
  return { cols, rows: dataRows };
}

app.get('/api/sheets/:sheet', async (req, res) => {
  try {
    const { sheet } = req.params;
    console.log(`[Server] Request received for sheet: ${sheet}`);
    
    const data = await fetchSheetFromGoogle(sheet);
    
    res.json({ data: data.rows, cols: data.cols });
  } catch (error) {
    console.error('[Server] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.use(express.static(join(__dirname, '../dist')));

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

app.listen(PORT, async () => {
  console.log(`[Server] ========================================`);
  console.log(`[Server] Server running on http://localhost:${PORT}`);
  console.log(`[Server] Spreadsheet: ${spreadsheetId}`);
  
  try {
    const auth = await getAuthClient();
    console.log(`[Server] Auth client ready`);
  } catch (e) {
    console.error('[Server] Auth error:', e.message);
  }
  
  console.log(`[Server] ========================================`);
});