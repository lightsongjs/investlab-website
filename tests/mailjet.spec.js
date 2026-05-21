import { test, expect } from '@playwright/test';
import { Buffer } from 'buffer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '..', '..', 'ilProduct', '.env');

if (fs.existsSync(ENV_PATH)) {
  fs.readFileSync(ENV_PATH, 'utf8').split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  });
}

const EMAIL     = 'lightsongjs@gmail.com';
const API_KEY   = process.env.MAILJET_API_KEY;
const SECRET    = process.env.MAILJET_SECRET_KEY;
const LIST_ID   = process.env.MAILJET_CONTACT_LIST_ID;
const AUTH      = () => `Basic ${Buffer.from(`${API_KEY}:${SECRET}`).toString('base64')}`;

test.beforeAll(() => {
  const missing = [
    ['MAILJET_API_KEY', API_KEY],
    ['MAILJET_SECRET_KEY', SECRET],
    ['MAILJET_CONTACT_LIST_ID', LIST_ID],
  ].filter(([, value]) => !value).map(([key]) => key);

  expect(missing, `Missing Mailjet env vars: ${missing.join(', ')}`).toEqual([]);
});

// ── Subscribe: contactul trebuie să fie în lista newsletter ────
test('Mailjet → lightsongjs@gmail.com e în lista newsletter', async ({ request }) => {
  const res  = await request.get(
    `https://api.mailjet.com/v3/REST/listrecipient?ContactsList=${LIST_ID}&ContactEmail=${EMAIL}`,
    { headers: { Authorization: AUTH() } }
  );
  const data = await res.json();
  expect(data.Count).toBeGreaterThan(0);
  expect(data.Data[0].IsUnsubscribed).toBe(false);
  expect(data.Data[0].ListID).toBe(Number(LIST_ID));
});

// ── Notify: un email a fost trimis către hello.investlab@gmail.com ──
test('Mailjet → email trimis la hello.investlab@gmail.com pentru membership', async ({ request }) => {
  const res  = await request.get(
    'https://api.mailjet.com/v3/REST/message?FromEmail=mihai@investlab.ro&Subject=Cerere+nou%C4%83%3A+Membership&Limit=5',
    { headers: { Authorization: AUTH() } }
  );
  const data = await res.json();
  expect(data.Count).toBeGreaterThan(0);
});

test('Mailjet → email trimis la hello.investlab@gmail.com pentru mentorat', async ({ request }) => {
  const res  = await request.get(
    'https://api.mailjet.com/v3/REST/message?FromEmail=mihai@investlab.ro&Subject=Cerere+nou%C4%83%3A+Mentorat+1-la-1&Limit=5',
    { headers: { Authorization: AUTH() } }
  );
  const data = await res.json();
  expect(data.Count).toBeGreaterThan(0);
});
