import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Buffer } from 'buffer';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.join(__dirname, '..');
const ENV_PATH  = path.join(ROOT, '..', 'investLabProduct', '.env');

// Load .env manual (fără dotenv extra dependency)
fs.readFileSync(ENV_PATH, 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && !k.startsWith('#') && v.length) process.env[k.trim()] = v.join('=').trim();
});

const { MAILJET_API_KEY, MAILJET_SECRET_KEY, MAILJET_CONTACT_LIST_ID } = process.env;
const auth = () => `Basic ${Buffer.from(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`).toString('base64')}`;

const MIME = { '.html': 'text/html', '.svg': 'image/svg+xml', '.js': 'application/javascript', '.css': 'text/css' };

async function readBody(req) {
  return new Promise(resolve => {
    let d = '';
    req.on('data', c => d += c);
    req.on('end', () => resolve(d));
  });
}

async function apiSubscribe(body) {
  const email = (body.email || '').trim().toLowerCase();
  const res = await fetch(
    `https://api.mailjet.com/v3/REST/contactslist/${MAILJET_CONTACT_LIST_ID}/managecontact`,
    {
      method: 'POST',
      headers: { Authorization: auth(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Action: 'addnoforce' }),
    }
  );
  return res.ok;
}

async function apiNotify(body) {
  const { email, type } = body;
  const subjects = { membership: 'Cerere nouă: Membership', mentorat: 'Cerere nouă: Mentorat 1-la-1' };
  const res = await fetch('https://api.mailjet.com/v3.1/send', {
    method: 'POST',
    headers: { Authorization: auth(), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Messages: [{
        From:     { Email: 'mihai@investlab.ro', Name: 'InvestLab' },
        To:       [{ Email: 'lightsongpy@gmail.com' }, { Email: 'mihaiclaudiusuciu87@gmail.com' }],
        Subject:  subjects[type] || 'Cerere nouă de pe site',
        TextPart: `Email: ${email}`,
      }],
    }),
  });
  return res.ok;
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/subscribe') {
    const body = JSON.parse(await readBody(req));
    const ok   = await apiSubscribe(body);
    res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ok ? { success: true } : { error: 'Eroare server' }));
    return;
  }

  if (req.method === 'POST' && req.url === '/api/notify') {
    const body = JSON.parse(await readBody(req));
    const ok   = await apiNotify(body);
    res.writeHead(ok ? 200 : 500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(ok ? { success: true } : { error: 'Eroare server' }));
    return;
  }

  // Static files
  const filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const fullPath = path.join(ROOT, filePath);
  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(fs.readFileSync(fullPath));
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(3333, () => console.log('Test server: http://localhost:3333'));
